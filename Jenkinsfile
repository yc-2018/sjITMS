// git 信息
def git_auth = '78481b43-7726-4681-8e6c-559fdb6bc2fe'
def git_url = 'git@192.168.111.123:iwms-group/iwms-web.git'

//Harbor信息
def harbor_url = "192.168.111.81:85" 
def harbor_project_name = "iwms" 
def harbor_auth = "ab5ed645-b3d7-41f2-b066-ed748ff4e209"

node {
	def rollback = true;
	// 缺省版本号
	if(!version_tag){
		version_tag = new Date().format("yyyyMMddHHmmss"); 
		rollback = false;
	}

    def project_name = "iwms-web";
    def image_name =  "${project_name}:${version_tag}";
    
	// 如果是回滚的情况下就不重新编译了
	if(!rollback) {
		stage('拉取代码') {
			git branch: "${branch}",credentialsId: "${git_auth}", url: "${git_url}"
		}

		stage('编译构建') {
			nodejs("nodejs16") {
				sh "yarn install && yarn build:docker"
			}
		}
		
		stage('生成镜像') {
			sh "docker build --label 'com.timeexpress.service=${project_name}' -t ${image_name} ."
		}
		
		stage('上传镜像') {
			// 登录Harbor
			withCredentials([usernamePassword(credentialsId: "${harbor_auth}",
				passwordVariable: 'password', 
				usernameVariable: 'username')]) { 
				sh "docker login -u ${username} -p ${password} ${harbor_url}" 
			}
			
			// 给镜像打标签 
			sh "docker tag ${image_name} ${harbor_url}/${harbor_project_name}/${image_name}"
			sh "docker tag ${image_name} ${harbor_url}/${harbor_project_name}/${project_name}:latest"
			// 上传镜像 
			sh "docker push ${harbor_url}/${harbor_project_name}/${image_name}"
			sh "docker push ${harbor_url}/${harbor_project_name}/${project_name}:latest"
			
			// 删除本地镜像 
			sh "docker rmi -f ${image_name}" 
			sh "docker rmi -f ${harbor_url}/${harbor_project_name}/${image_name}" 
			sh "docker rmi -f ${harbor_url}/${harbor_project_name}/${project_name}:latest" 
		}
	}
	
	stage('远程部署') {
        def remote = [:]
        remote.name = "${server}"
        remote.host = "${server}"
        remote.allowAnyHosts = true
        withCredentials([usernamePassword(credentialsId: "${server}",
            passwordVariable: 'password', 
            usernameVariable: 'username')]) { 
            remote.user = "${username}"
            remote.password = "${password}"
        }
        
        sshCommand remote: remote, command: "sh -x /app_data/iwms/iwms_deploy.sh ${harbor_url} ${project_name}"
	}
}
