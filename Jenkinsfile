pipeline {
    agent any

    parameters {
        choice(name: 'ENV',   choices: ['qa', 'dev', 'staging'], description: 'Target environment')
        choice(name: 'SUITE', choices: ['all', 'web', 'api', 'mobile', 'e2e'], description: 'Test suite')
    }

    environment {
        CI = 'true'
    }

    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install --with-deps chromium firefox webkit'
            }
        }

        stage('Lint & Type-check') {
            steps {
                sh 'npm run typecheck'
            }
        }

        stage('Run Tests') {
            environment {
                ENV = "${params.ENV}"
                BROWSERSTACK_USERNAME   = credentials('browserstack-username')
                BROWSERSTACK_ACCESS_KEY = credentials('browserstack-access-key')
            }
            steps {
                script {
                    def cmd = params.SUITE == 'all'
                        ? 'npm test'
                        : "npm run test:${params.SUITE}"
                    sh cmd
                }
            }
            post {
                always {
                    junit 'reports/junit.xml'
                }
            }
        }

        stage('Publish Report') {
            steps {
                publishHTML(target: [
                    allowMissing         : false,
                    alwaysLinkToLastBuild: true,
                    keepAll              : true,
                    reportDir            : 'reports/html',
                    reportFiles          : 'index.html',
                    reportName           : 'Playwright Report'
                ])
            }
        }
    }

    post {
        failure {
            emailext(
                subject: "FAILED: '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
                body: "Build failed. Details: ${env.BUILD_URL}",
                to: '$DEFAULT_RECIPIENTS'
            )
        }
        always {
            archiveArtifacts artifacts: 'reports/**/*,test-results/**/*', allowEmptyArchive: true
        }
    }
}
