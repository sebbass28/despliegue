import boto3


REGION = 'us-east-1'


def cliente_ec2():
    return boto3.client('ec2', region_name=REGION)


def crear_vpc():
    ec2 = cliente_ec2()
    vpc = ec2.create_vpc(CidrBlock='192.168.0.0/16')
    vpc_id = vpc['Vpc']['VpcId']
    ec2.modify_vpc_attribute(VpcId=vpc_id, EnableDnsSupport={'Value': True})
    ec2.modify_vpc_attribute(VpcId=vpc_id, EnableDnsHostnames={'Value': True})
    ec2.create_tags(
        Resources=[vpc_id],
        Tags=[
            {'Key': 'Name', 'Value': 'miVPC-Boto3'},
            {'Key': 'entorno', 'Value': 'prueba'}
        ]
    )
    print(f'VPC creada con ID: {vpc_id}')
    return vpc_id


def crear_subred(vpc_id):
    ec2 = cliente_ec2()
    subnet = ec2.create_subnet(
        VpcId=vpc_id,
        CidrBlock='192.168.5.0/24',
        AvailabilityZone=f'{REGION}a',
        TagSpecifications=[{
            'ResourceType': 'subnet',
            'Tags': [{'Key': 'Name', 'Value': 'subnet-1-sebas'}]
        }]
    )
    subnet_id = subnet['Subnet']['SubnetId']
    ec2.modify_subnet_attribute(
        SubnetId=subnet_id,
        MapPublicIpOnLaunch={'Value': True}
    )
    print(f'Subred creada con ID: {subnet_id}')
    return subnet_id


def crear_grupo_seguridad(vpc_id):
    ec2 = cliente_ec2()
    sg = ec2.create_security_group(
        GroupName='gs-sebas',
        Description='gs puerto 22 e icmp',
        VpcId=vpc_id
    )
    security_group_id = sg['GroupId']
    ec2.authorize_security_group_ingress(
        GroupId=security_group_id,
        IpPermissions=[
            {
                'IpProtocol': 'tcp',
                'FromPort': 22,
                'ToPort': 22,
                'IpRanges': [{'CidrIp': '0.0.0.0/0'}]
            },
            {
                'IpProtocol': 'icmp',
                'FromPort': -1,
                'ToPort': -1,
                'IpRanges': [{'CidrIp': '0.0.0.0/0'}]
            }
        ]
    )
    print(f'Grupo de seguridad creado con ID: {security_group_id}')
    return security_group_id


def internet_gateway(vpc_id):
    ec2 = cliente_ec2()
    igw = ec2.create_internet_gateway(
        TagSpecifications=[{
            'ResourceType': 'internet-gateway',
            'Tags': [{'Key': 'Name', 'Value': 'ig-sebas'}]
        }]
    )
    igw_id = igw['InternetGateway']['InternetGatewayId']
    ec2.attach_internet_gateway(InternetGatewayId=igw_id, VpcId=vpc_id)
    print(f'Internet Gateway creado con ID: {igw_id}')
    return igw_id


def crear_tabla_rutas(vpc_id, subnet_id, igw_id):
    ec2 = cliente_ec2()
    route_table = ec2.create_route_table(
        VpcId=vpc_id,
        TagSpecifications=[{
            'ResourceType': 'route-table',
            'Tags': [{'Key': 'Name', 'Value': 'rt-sebas'}]
        }]
    )
    route_table_id = route_table['RouteTable']['RouteTableId']
    ec2.create_route(
        RouteTableId=route_table_id,
        DestinationCidrBlock='0.0.0.0/0',
        GatewayId=igw_id
    )
    ec2.associate_route_table(
        RouteTableId=route_table_id,
        SubnetId=subnet_id
    )
    print(f'Tabla de rutas creada con ID: {route_table_id}')
    return route_table_id


def crear_ec2(subnet_id, security_group_id):
    ec2 = cliente_ec2()
    response = ec2.run_instances(
        ImageId='ami-0fa5967347d08d2df',
        InstanceType='t3.small',
        KeyName='vockey',
        MinCount=1,
        MaxCount=1,
        TagSpecifications=[{
            'ResourceType': 'instance',
            'Tags': [{'Key': 'Name', 'Value': 'instancia-sebas'}]
        }],
        NetworkInterfaces=[{
            'DeviceIndex': 0,
            'SubnetId': subnet_id,
            'AssociatePublicIpAddress': True,
            'Groups': [security_group_id]
        }]
    )
    instance_id = response['Instances'][0]['InstanceId']
    print(f'Instancia creada con ID: {instance_id}')
    return instance_id


def eliminar_vpc(vpc_id):
    ec2 = cliente_ec2()
    instances = ec2.describe_instances(
        Filters=[{'Name': 'vpc-id', 'Values': [vpc_id]}]
    )
    instance_ids = [
        instance['InstanceId']
        for reservation in instances['Reservations']
        for instance in reservation['Instances']
        if instance['State']['Name'] not in ('terminated', 'shutting-down')
    ]
    if instance_ids:
        ec2.terminate_instances(InstanceIds=instance_ids)
        ec2.get_waiter('instance_terminated').wait(InstanceIds=instance_ids)
        print(f'Instancias terminadas: {", ".join(instance_ids)}')

    route_tables = ec2.describe_route_tables(
        Filters=[{'Name': 'vpc-id', 'Values': [vpc_id]}]
    )['RouteTables']
    for route_table in route_tables:
        if any(association.get('Main', False)
               for association in route_table['Associations']):
            continue
        for association in route_table['Associations']:
            ec2.disassociate_route_table(
                AssociationId=association['RouteTableAssociationId']
            )
        ec2.delete_route_table(RouteTableId=route_table['RouteTableId'])

    internet_gateways = ec2.describe_internet_gateways(
        Filters=[{'Name': 'attachment.vpc-id', 'Values': [vpc_id]}]
    )['InternetGateways']
    for internet_gateway_data in internet_gateways:
        igw_id = internet_gateway_data['InternetGatewayId']
        ec2.detach_internet_gateway(InternetGatewayId=igw_id, VpcId=vpc_id)
        ec2.delete_internet_gateway(InternetGatewayId=igw_id)

    subnets = ec2.describe_subnets(
        Filters=[{'Name': 'vpc-id', 'Values': [vpc_id]}]
    )['Subnets']
    for subnet in subnets:
        ec2.delete_subnet(SubnetId=subnet['SubnetId'])

    security_groups = ec2.describe_security_groups(
        Filters=[{'Name': 'vpc-id', 'Values': [vpc_id]}]
    )['SecurityGroups']
    for security_group in security_groups:
        if security_group['GroupName'] != 'default':
            ec2.delete_security_group(GroupId=security_group['GroupId'])

    ec2.delete_vpc(VpcId=vpc_id)
    print(f'VPC eliminada: {vpc_id}')


if __name__ == '__main__':
    switch = input('¿Desea eliminar una VPC? (s/n): ')
    if switch.lower() == 's':
        vpc_id = input('Ingrese el ID de la VPC a eliminar: ')
        eliminar_vpc(vpc_id)
    else:
        vpc_id = crear_vpc()
        subnet_id = crear_subred(vpc_id)
        security_group_id = crear_grupo_seguridad(vpc_id)
        igw_id = internet_gateway(vpc_id)
        route_table_id = crear_tabla_rutas(vpc_id, subnet_id, igw_id)
        instance_id = crear_ec2(subnet_id, security_group_id)
        print(f'Proceso completado. VPC: {vpc_id}')
        print(f'Subred: {subnet_id}')
        print(f'Tabla de rutas: {route_table_id}')
        print(f'Instancia: {instance_id}')