pipeline {

    /*
     * runs inside a container.
     * Node.js build/test/security stages use the required Node 16 Docker image.
     */
    agent any

    options {
        // Perform checkout explicitly so it appears clearly in pipeline logs.
        skipDefaultCheckout(true)

        // Timestamps to console logs.
        timestamps()

        // Prevent two builds from modifying the same workspace simultaneously.
        disableConcurrentBuilds()

        // Prevent unlimited Jenkins build-history growth.
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    environment {
        // Docker hub username and repo
        APP_IMAGE = 'alidevopsisec/isec6000a2'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm

                sh '''
                    echo "Git commit:"
                    git rev-parse --short HEAD
                '''
            }
        }


        stage('Install Dependencies') {

            agent {
                docker {
                    image 'node:16'
                    reuseNode true
                }
            }

            steps {
                sh '''
                    echo "Node version:"
                    node --version

                    echo "NPM version:"
                    npm --version

                    npm ci
                '''
            }
        }


        stage('Unit Tests') {

            agent {
                docker {
                    image 'node:16'
                    reuseNode true
                }
            }

            steps {
                sh '''
                    set +e

                    npm test > test-results.log 2>&1
                    TEST_EXIT=$?

                    set -e

                    cat test-results.log

                    exit $TEST_EXIT
                '''
            }
        }


        stage('Security Scan') {

            agent {
                docker {
                    image 'node:16'
                    reuseNode true
                }
            }

            steps {
                sh '''
                    echo "Running dependency vulnerability assessment..."

                    set +e

                    npm audit \
                        --audit-level=high \
                        --json \
                        > npm-audit.json

                    AUDIT_EXIT=$?

                    set -e

                    cat npm-audit.json

                    if [ "$AUDIT_EXIT" -ne 0 ]; then
                        echo "SECURITY GATE FAILED"
                        echo "High or Critical dependency vulnerabilities were detected."
                        exit "$AUDIT_EXIT"
                    fi

                    echo "SECURITY GATE PASSED"
                    echo "No High or Critical dependency vulnerabilities detected."
                '''
            }
        }


        stage('Docker Build') {
            steps {
                sh '''
                    docker build \
                        -t ${APP_IMAGE}:${BUILD_NUMBER} \
                        -t ${APP_IMAGE}:latest \
                        .
                '''
            }
        }


        stage('Docker Push') {
            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKERHUB_USER',
                        passwordVariable: 'DOCKERHUB_TOKEN'
                    )
                ]) {

                    sh '''
                        echo "$DOCKERHUB_TOKEN" |
                            docker login \
                                -u "$DOCKERHUB_USER" \
                                --password-stdin

                        docker push ${APP_IMAGE}:${BUILD_NUMBER}

                        docker push ${APP_IMAGE}:latest

                        docker logout
                    '''
                }
            }
        }
    }


    post {

        always {
            archiveArtifacts(
                artifacts: 'test-results.log,npm-audit.json',
                allowEmptyArchive: true
            )
        }

        success {
            echo 'CI/CD pipeline completed successfully.'
        }

        failure {
            echo 'CI/CD pipeline failed. Review the failed stage and console logs.'
        }
    }
}
