



const apiUrl = ''														
const registerForm = document.querySelector('#register-form')
hookMessageTags()														


registerForm.addEventListener('submit', handleSubmitForm)				


async function handleSubmitForm(event) {
	
	event.preventDefault()								
	clearMessages()										
	const formData = getFormData(registerForm, true)	
	let result = {message: ''}

	try {
		const response = await fetch(apiUrl + '/users', {			
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(formData)
		})
		result = await response.json()			
		if (!response.ok) {
			throw `Failure creating new User! ${response.statusText} - ${response.status}`
		} 
		
	} catch (err) {
		setCookie('auth_token', 'deleted', -1)			
		message1.textContent = 'ERROR!'
		message2.textContent = err + " " + result.error
		message3.textContent = "Unable to POST new User request! Check name / email / password and try again!"
		throw message3.textContent
	}

	setCookie('task_manager_auth_token', result.token)				
	window.location.href = "/"										
}