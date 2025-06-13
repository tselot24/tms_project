//111a80069b10a3165438ffdef7645d85cd
pipeline {
    agent none

    environment {
        DOCKER_REPO = 'tms'
        BACKEND_IMAGE = "${DOCKER_REPO}:backend"
        FRONTEND_IMAGE = "${DOCKER_REPO}:frontend"
        DOCKER_CREDENTIALS_ID = 'tselot24_docker'
    }

    stages {
        stage('Clone Monorepo') {
            agent { label 'master' }
            steps {
                git branch: 'main', credentialsId: 'tselot24_github', url: 'git@github.com:tselot24/tms_project.git'
            }
        }

        stage('Detect Changes') {
            agent { label 'master' }
            steps {
                script {
                    def changedFiles = sh(script: "git diff --name-only HEAD HEAD~1", returnStdout: true).trim().split("\n")
                    env.BACKEND_CHANGED = changedFiles.any { it.startsWith('tms_backend/') }.toString()
                    env.FRONTEND_CHANGED = changedFiles.any { it.startsWith('tms_front/') }.toString()
                }
            }
        }
        
        stage('SonarQube Analysis') {
            agent { label 'master' }
            steps{
                script{
                    def scannerHome = tool 'SonarScanner';
                    withSonarQubeEnv("sonarQube") {
                      sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
           }
       }
       

        stage('Build Images') {
            parallel {
                stage('Build Backend') {
                    agent { label 'agent-56' }
                    // when {
                    //     expression { return env.BACKEND_CHANGED == 'true' }
                    // }
                    steps {
                        dir('tms_backend') {
                            sh "docker build -t $BACKEND_IMAGE ."
                        }
                    }
                }
                stage('Build Frontend') {
                    agent { label 'agent-56' }
                    // when {
                    //     expression { return env.FRONTEND_CHANGED == 'true' }
                    // }
                    steps {
                        dir('tms_front') {
                            sh "docker build -t $FRONTEND_IMAGE ."
                        }
                    }
                }
            }
        }

        // stage('Login to Docker Hub') {
        //     // when {
        //     //     anyOf {
        //     //         expression { return env.BACKEND_CHANGED == 'true' }
        //     //         expression { return env.FRONTEND_CHANGED == 'true' }
        //     //     }
        //     // }
        //     steps {
        //         withCredentials([usernamePassword(
        //             credentialsId: "$DOCKER_CREDENTIALS_ID",
        //             usernameVariable: 'DOCKER_USER',
        //             passwordVariable: 'DOCKER_PASS'
        //         )]) {
        //             sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
        //         }
        //     }
        // }

        // stage('Push Images') {
        //     parallel {
        //         stage('Push Backend') {
        //             // when {
        //             //     expression { return env.BACKEND_CHANGED == 'true' }
        //             // }
        //             steps {
        //                 sh "docker push $BACKEND_IMAGE"
        //             }
        //         }
        //         stage('Push Frontend') {
        //             when {
        //                 expression { return env.FRONTEND_CHANGED == 'true' }
        //             }
        //             steps {
        //                 sh "docker push $FRONTEND_IMAGE"
        //             }
        //         }
        //     }
        // }

        stage('Deploy') {
            agent { label 'agent-56' }
            // when {
            //     anyOf {
            //         expression { return env.BACKEND_CHANGED == 'true' }
            //         expression { return env.FRONTEND_CHANGED == 'true' }
            //     }
            // }
            steps {
                script {
                     // docker stack rm tms || true
                    //docker stack deploy -c docker-compose.yml tms
                    sh '''
                    docker compose down
                    docker compose up -d 
                    '''
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
    }
}

