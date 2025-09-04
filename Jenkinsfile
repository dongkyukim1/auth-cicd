pipeline {
  agent any

  parameters {
    string(name: 'REGISTRY', defaultValue: 'docker.io/dongkyu93', description: 'Docker registry namespace (e.g., docker.io/<your-account>)')
    string(name: 'NAMESPACE', defaultValue: 'app', description: 'Kubernetes namespace')
  }

  environment {
    REGISTRY = "${params.REGISTRY}"
    REPO_BACK = "${REGISTRY}/auth-backend"
    REPO_FRONT = "${REGISTRY}/auth-frontend"
    NAMESPACE = "${params.NAMESPACE}"
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Init') {
      steps {
        script {
          env.IMAGE_TAG = env.GIT_COMMIT ? env.GIT_COMMIT.take(7) : sh(script: 'git rev-parse --short=7 HEAD', returnStdout: true).trim()
        }
      }
    }

    stage('Docker Login') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
        }
      }
    }

    stage('Backend Build') {
      steps {
        dir('backend') {
          sh 'npm ci'
          sh 'npm run build'
          sh 'docker build -t ${REPO_BACK}:${IMAGE_TAG} -t ${REPO_BACK}:latest .'
        }
      }
    }

    stage('Frontend Build') {
      steps {
        dir('frontend') {
          sh 'npm ci'
          sh 'npm run build'
          sh 'docker build -t ${REPO_FRONT}:${IMAGE_TAG} -t ${REPO_FRONT}:latest .'
        }
      }
    }

    stage('Push Images') {
      steps {
        sh 'docker push ${REPO_BACK}:${IMAGE_TAG} && docker push ${REPO_BACK}:latest'
        sh 'docker push ${REPO_FRONT}:${IMAGE_TAG} && docker push ${REPO_FRONT}:latest'
      }
    }

    stage('K8s Manifests Apply (idempotent)') {
      steps {
        withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE')]) {
          sh '''
            export KUBECONFIG="$KUBECONFIG_FILE"
            kubectl get ns ${NAMESPACE} || kubectl create ns ${NAMESPACE}
            # Optional: apply secrets if provided by ops (do not fail if missing)
            if [ -f k8s/secrets.yaml ]; then kubectl apply -f k8s/secrets.yaml; fi
            kubectl apply -f k8s/redis.yaml
            kubectl apply -f k8s/monitoring/prometheus.yaml
            kubectl apply -f k8s/monitoring/grafana.yaml
            kubectl apply -f k8s/backend.yaml
            kubectl apply -f k8s/frontend.yaml
          '''
        }
      }
    }

    stage('Deploy (set image + rollout)') {
      steps {
        withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE')]) {
          sh '''
            export KUBECONFIG="$KUBECONFIG_FILE"
            kubectl -n ${NAMESPACE} set image deployment/backend backend=${REPO_BACK}:${IMAGE_TAG} --record
            kubectl -n ${NAMESPACE} set image deployment/frontend frontend=${REPO_FRONT}:${IMAGE_TAG} --record
            kubectl -n ${NAMESPACE} rollout status deployment/backend --timeout=180s
            kubectl -n ${NAMESPACE} rollout status deployment/frontend --timeout=180s
          '''
        }
      }
    }
  }
}
