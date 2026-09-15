pipeline {
  agent any

  environment {
    PLATFORM = 'android'
    ENVIRONMENT = 'qa'
    DEVICE_NAME = 'Pixel_7_Pro'
    APPIUM_HOST = '127.0.0.1'
    APPIUM_PORT = '4723'
    CI = 'true'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install Dependencies') {
      steps {
        sh 'npm install'
      }
    }

    stage('Type Check') {
      steps {
        sh 'npm run type-check'
      }
    }

    stage('Run Mobile Smoke Tests') {
      steps {
        sh 'npm run test:smoke'
      }
      post {
        always {
          archiveArtifacts artifacts: 'reports/**', fingerprint: true
          junit 'reports/**/*.xml'
        }
      }
    }

    stage('Publish Allure Report') {
      steps {
        sh 'npm run report:allure'
      }
    }
  }
}
