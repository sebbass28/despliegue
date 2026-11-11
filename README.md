# despliegue — Prácticas de despliegue y servicios en la nube

Repositorio de prácticas del **Curso de Especialización en Recursos y Servicios en la Nube**.
La pieza principal es una pequeña web de login (`Despliegue-Servicios-Administrados/`) con un
pipeline **CI/CD en GitHub Actions**: validación y tests en cada cambio, y despliegue automático
a **GitHub Pages** y a un bucket **Amazon S3**.

## Qué contiene

| Carpeta | Contenido |
|---|---|
| `Despliegue-Servicios-Administrados/` | Web estática (HTML, CSS, JS) con lógica de login validada y tests unitarios (`node:test`). Es lo que se despliega. |
| `1CES-Admin-BD-Emmagatzematge/static-bucket/` | Juego *Costa Rápida* (JavaScript puro) pensado para servirse desde un bucket S3 (+ CloudFront opcional) con `deploy.sh`. |
| `1CES-Admin-BD-Emmagatzematge/aws-academy-fp-asir/` | Material de prácticas de AWS Academy: plantillas CloudFormation (VPC, RDS, EBS, EFS, Elastic Beanstalk…) y enunciados. |
| `1CES-Admin-Computacio/` | `cambia_tipo_ec2.sh`: cambia el tipo de una instancia EC2 con la AWS CLI (solo las etiquetadas con el propietario). |
| `1CES-Admin-Xarxes/` | Creación de una VPC en AWS con la AWS CLI (`script.sh`) y con Python/boto3 (`prueba.py`). |

## CI/CD

| Workflow | Cuándo | Qué hace |
|---|---|---|
| `ci.yml` — *CI Validar y Testear* | push, pull request y manual | `npm ci`, **html-validate**, **stylelint**, **eslint** y `npm test` |
| `cd.yml` — *CD Deploy a GitHub Pages* | push a `main` y manual | Publica `Despliegue-Servicios-Administrados/` en GitHub Pages |
| `s3.yml` — *Copia a S3* | push a `main` | `aws s3 sync` de la web al bucket con credenciales en GitHub Secrets |

Secretos que usa `s3.yml` (Settings → Secrets and variables → Actions):
`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`, `AWS_REGION`, `S3_BUCKET`.
Ninguna credencial se guarda en el repositorio.

## Cómo ejecutarlo en local

Requisitos: Node.js 20+ (el CI usa Node 24).

```bash
npm ci
npm test                                   # tests unitarios

cd Despliegue-Servicios-Administrados
npx html-validate index.html               # validar HTML
npx stylelint "css/**/*.css"               # lint CSS
npx eslint js/                             # lint JS
python3 -m http.server 8080                # ver la web en http://localhost:8080
```

Desplegar el juego a un bucket propio:

```bash
cd 1CES-Admin-BD-Emmagatzematge/static-bucket
./deploy.sh mi-bucket [id-distribucion-cloudfront]
```

## Estructura

```
.
├── .github/workflows/        # ci.yml, cd.yml, s3.yml
├── Despliegue-Servicios-Administrados/
│   ├── index.html
│   ├── css/style.css
│   ├── js/app.js, js/login-logic.js
│   └── test/test.js
├── 1CES-Admin-BD-Emmagatzematge/
├── 1CES-Admin-Computacio/
├── 1CES-Admin-Xarxes/
└── package.json              # herramientas de lint y script de test
```
