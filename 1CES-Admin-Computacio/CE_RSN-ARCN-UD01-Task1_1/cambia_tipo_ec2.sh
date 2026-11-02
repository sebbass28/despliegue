# Fichero cambia_tipo_ec2.sh 
# !/usr/bin/env bash
# cambia_tipo_ec2.sh - Cambia el tipo de una instancia de EC2
# Autor: Sebastián Agudelo Castrillón (js)
# Fecha: 21/10/2026
# Uso cambia_tipo_ec2.sh [-y] i-0886ac76c980c684a t3.micro

set -uo pipefail export AWS_PAGER=""           # sin paginador: el script no se detiene  

  

# Solo se modifican las instancias con esta etiqueta Propietario  

PROPIETARIO="js"  

I="Reservations[0].Instances[0]"  

  

error() {                            # error MENSAJE CODIGO   
    echo "ERROR: $1" >&2   exit "$2"   

}  

  

uso() {  

  echo "Uso: $(basename "$0") [-y] ID_INSTANCIA TIPO_NUEVO" >&2   exit 1  

}  

  

[ $# -eq 2 ] || uso  

ID=$1  

TIPO_NUEVO=$2  

  

DATOS=$(aws ec2 describe-instances --instance-ids "$ID" --output text \  

  --query "$I.[State.Name,InstanceType]" 2>/dev/null) \   || error "La instancia $ID no existe o no es accesible" 2 read -r ESTADO TIPO_ACTUAL <<< "$DATOS"  


