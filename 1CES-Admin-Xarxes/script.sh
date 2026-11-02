#!/bin/bash

#VPC
VPC_ID=$(aws ec2 create-vpc --cidr-block 192.168.3.0/24 \
    --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=nube1sebas},{Key=entorno,Value=prueba}]' \
    --query Vpc.VpcId --output text)

# muestro el id
echo $VPC_ID

#habilitar DNS hostnames
aws ec2 modify-vpc-attribute \
    --vpc-id $VPC_ID \
    --enable-dns-hostnames "{\"Value\":true}"

SUB_ID=$( aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 192.168.3.0/28 \
    --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=subnet1-sebas}]' \
    --region us-east-1 \
    --query Subnet.SubnetId --output text)

echo $SUB_ID


# se habilita ipv4 publica en subred

aws ec2 modify-subnet-attribute --subnet-id $SUB_ID --map-public-ip-on-launch


SG_ID=$(aws ec2 create-security-group \
    --group-name gs-sebas \
    --description "gs puerto 22" \
    --region us-east-1 \
    --vpc-id $VPC_ID \
    --query GroupId --output text )

echo $SG_ID

aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --ip-permissions '[{"IpProtocol":"tcp","FromPort":22,"ToPort":22, "IpRanges":[{"CidrIp":"0.0.0.0/0"}]}]'

aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --ip-permissions '[{"IpProtocol":"icmp","FromPort":-1,"ToPort":-1, "IpRanges":[{"CidrIp":"0.0.0.0/0"}]}]'

aws ec2 create-tags \
    --resources $SG_ID \
    --tags Key=Name,Value=sg-sebas



# creo una instancia EC2 con la imagen de Ubuntu 24.04 y la asocio al grupo de seguridad creado

aws ec2 run-instances \
    --image-id ami-0fa5967347d08d2df \
    --instance-type t3.small \
    --subnet-id $SUB_ID \
    --security-group-ids $SG_ID \
    --key-name vockey \
    --associate-public-ip-address \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Nombre,Value=instancia-sebas}]' \
    --query Instances.InstanceId --output text



IG=$(aws ec2 create-internet-gateway \
    --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=my-igw}]' \
    --query InternetGateway.InternetGatewayId --output text)

aws ec2 attach-internet-gateway \
    --internet-gateway-id $IG \
    --vpc-id $VPC_ID


RT=$(aws ec2 create-route-table \
    --vpc-id $VPC_ID \
    --query RouteTable.RouteTableId --output text)

aws ec2 create-route \
    --route-table-id $RT \
    --destination-cidr-block 0.0.0.0/0 \
    --gateway-id $IG

aws ec2 associate-route-table \
    --route-table-id $RT \
    --subnet-id $SUB_ID


aws ec2 modify-subnet-attribute \
    --subnet-id $SUB_ID \
    --map-public-ip-on-launch



# Obtiene las VPCs creadas por este script
VPC_IDS=$(aws ec2 describe-vpcs \
    --filters "Name=tag:Name,Values=nube1sebas" \
    --query "Vpcs[*].VpcId" \
    --output text)

# Recorre los IDs de las VPCs y las elimina
for VPC_ID in $VPC_IDS; do
    echo "Eliminando VPC con ID: $VPC_ID..."

    # Termina primero las instancias que usan la VPC
    INSTANCE_IDS=$(aws ec2 describe-instances \
        --filters "Name=vpc-id,Values=$VPC_ID" \
                  "Name=instance-state-name,Values=pending,running,stopping,stopped" \
        --query "Reservations[*].Instances[*].InstanceId" \
        --output text)
    if [[ -n "$INSTANCE_IDS" ]]; then
        aws ec2 terminate-instances --instance-ids $INSTANCE_IDS
        aws ec2 wait instance-terminated --instance-ids $INSTANCE_IDS
        echo "Instancias terminadas: $INSTANCE_IDS"
    fi

    # Desconecta y elimina los Internet Gateways de la VPC
    IGW_IDS=$(aws ec2 describe-internet-gateways \
        --filters "Name=attachment.vpc-id,Values=$VPC_ID" \
        --query "InternetGateways[*].InternetGatewayId" \
        --output text)
    for IGW_ID in $IGW_IDS; do
        aws ec2 detach-internet-gateway \
            --internet-gateway-id $IGW_ID \
            --vpc-id $VPC_ID
        aws ec2 delete-internet-gateway --internet-gateway-id $IGW_ID
        echo "Internet Gateway eliminado: $IGW_ID"
    done

    # Elimina las asociaciones y tablas de rutas no principales
    ROUTE_TABLE_IDS=$(aws ec2 describe-route-tables \
        --filters "Name=vpc-id,Values=$VPC_ID" \
        --query "RouteTables[*].RouteTableId" \
        --output text)
    for ROUTE_TABLE_ID in $ROUTE_TABLE_IDS; do
        IS_MAIN=$(aws ec2 describe-route-tables \
            --route-table-ids $ROUTE_TABLE_ID \
            --query "RouteTables[0].Associations[?Main==\`true\`] | length(@)" \
            --output text)
        if [[ "$IS_MAIN" == "0" ]]; then
            ASSOCIATION_IDS=$(aws ec2 describe-route-tables \
                --route-table-ids $ROUTE_TABLE_ID \
                --query "RouteTables[0].Associations[?Main==\`false\`].RouteTableAssociationId" \
                --output text)
            for ASSOCIATION_ID in $ASSOCIATION_IDS; do
                aws ec2 disassociate-route-table \
                    --association-id $ASSOCIATION_ID
            done
            aws ec2 delete-route-table --route-table-id $ROUTE_TABLE_ID
            echo "Tabla de rutas eliminada: $ROUTE_TABLE_ID"
        fi
    done

    # Elimina las subredes asociadas a la VPC
    SUBNET_IDS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query "Subnets[*].SubnetId" --output text)
    for SUBNET_ID in $SUBNET_IDS; do
        aws ec2 delete-subnet --subnet-id $SUBNET_ID
        echo "Subred eliminada: $SUBNET_ID"
    done

    # Elimina los grupos de seguridad creados por el script, excepto el default
    SG_IDS=$(aws ec2 describe-security-groups \
        --filters "Name=vpc-id,Values=$VPC_ID" \
        --query "SecurityGroups[?GroupName!=\`default\`].GroupId" \
        --output text)
    for SG_ID in $SG_IDS; do
        aws ec2 delete-security-group --group-id $SG_ID
        echo "Grupo de seguridad eliminado: $SG_ID"
    done

    #Elimina la VPC
    aws ec2 delete-vpc --vpc-id $VPC_ID
    echo "VPC eliminada: $VPC_ID"
done