pipeline {
    agent any

    environment {
        DOCKER_CREDENTIALS_ID = 'tselot24_docker'
        DOCKER_REGISTRY = 'docker.io'
    }

    stages {
        stage('Checkout Repository') {
            steps {
                git branch: 'main', credentialsId: 'tselot24_github',
                    url: 'git@github.com:tselot24/tms_project.git'
            }
        }

        stage('Build & Deploy') {
            parallel {
                stage('Backend Build & Deploy') {
                    when {
                        expression {
                            return checkForChanges('tms_backend/')
                        }
                    }
                    environment {
                        DOCKER_IMAGE = 'tselot24/tms_back:latest'
                    }
                    steps {
                        dir('tms_backend') {
                            script {
                                sh "docker build -t $DOCKER_IMAGE ."

                                withCredentials([usernamePassword(
                                    credentialsId: "$DOCKER_CREDENTIALS_ID",
                                    usernameVariable: 'DOCKER_USER',
                                    passwordVariable: 'DOCKER_PASS'
                                )]) {
                                    sh '''
                                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                                    '''
                                }

                                sh "docker push $DOCKER_IMAGE"
                                sh '''
                                docker stack rm tms_backend  true
                                docker stack deploy -c docker-compose.yml tms_backend
                                '''
                            }
                        }
                    }
                }

                stage('Frontend Build & Deploy') {
                    when {
                        expression {
                            return checkForChanges('tms_front/')
                        }
                    }
                    environment {
                        DOCKER_IMAGE = 'tselot24/tms_front:latest'
                    }
                    steps {
                        dir('tms_front') {
                            script {
                                sh "docker build -t $DOCKER_IMAGE ."

                                withCredentials([usernamePassword(
                                    credentialsId: "$DOCKER_CREDENTIALS_ID",
                                    usernameVariable: 'DOCKER_USER',
                                    passwordVariable: 'DOCKER_PASS'
                                )]) {
                                    sh '''
                                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                                    '''
                                }

                                sh "docker push $DOCKER_IMAGE"
                                sh '''
                                docker stack rm tms_front  true
                                docker stack deploy -c docker-compose.yml tms_front
                                '''
                            }
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            echo "✅ Build and deployment successful."
        }
        failure {
            echo "❌ Build or deployment failed."
        }
        always {
            echo "🧹 Cleanup done."
        }
    }
}

def checkForChanges(String folderPath) {
    def changeLogSets = currentBuild.changeSets
    for (changeLog in changeLogSets) {
        for (entry in changeLog.items) {
            for (file in entry.affectedFiles) {
                if (file.path.startsWith(folderPath)) {
                    return true
                }
            }
        }
    }
    return false
}
