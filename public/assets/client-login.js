


const apiUrl = ''												
const loginForm = document.querySelector('#login-form')
hookMessageTags()												


document.addEventListener('DOMContentLoaded', handlerDomLoaded)				
loginForm.addEventListener('submit', handleSubmitForm)						


 function handlerDomLoaded() {
	
	const rememberedEmail = getCookie('task_manager_email')
	
	if (rememberedEmail != '') {
		document.querySelector('#email-field').value = rememberedEmail
		document.querySelector('#remember-checkbox').checked = true
	}
 }

async function handleSubmitForm(event) {
	
	event.preventDefault()							
	clearMessages()									
	const formData = getFormData(loginForm, true)	
	let result;

	try {
		const response = await fetch(apiUrl + '/users/login', {			
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(formData)			
		})
		if (response.ok) {
			
			result = await response.json()			
		} else {
			throw `Failure logging in! ${response.statusText} - ${response.status}`
		}
	} catch (err) {
		setCookie('auth_token', 'deleted', -1)						
		setCookie('task_manager_auth_token', 'deleted', -1)
		message1.textContent = 'ERROR!'
		message2.textContent = err						
		message3.textContent = "Unable to POST Login request! Check email / password and try again!"
		throw message3.textContent
	}

	if (formData.remember) {
		setCookie('task_manager_email', result.user.email, 30)
	} else {
		setCookie('task_manager_email', 'deleted', -1)
	}
	
	setCookie('task_manager_auth_token', result.token)				
	window.location.href = "/"										
}