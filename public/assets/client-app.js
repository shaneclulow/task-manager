
const apiUrl = ''										
const authToken = 'Bearer ' + (getCookie('auth_token') || getCookie('task_manager_auth_token'))		
var todoItems = []										
hookMessageTags()										


document.addEventListener('DOMContentLoaded', handlerDomLoaded)									
document.querySelector('#input-form').addEventListener('submit', handleSubmitForm)				
document.querySelector('#todo-list').addEventListener('click', handleTodoListButtonClicks)		
document.querySelector('#btn-clear-all').addEventListener('click', handleClearAll);				
document.querySelector('#btn-logout').addEventListener('click', handleLogout);					


async function handlerDomLoaded() {

	try {
		const response = await fetch(apiUrl + '/tasks', {
			credentials: 'include',
			headers: {
				Authorization: authToken
			}
		})				
		if (response.ok) {
			todoItems = await response.json()						
		} else {
			throw `Failed to retrieve existing Task data! ${response.statusText} - ${response.status}`
		}
	} catch (err) {
		message1.textContent = 'ERROR!'
		message2.textContent = err
		message3.textContent = "Unable to GET All Tasks! Logout and Login then try again!"
		throw message3.textContent
	}

	if (todoItems.length) {
		todoItems.forEach( item => updatePageDom(item) )
	} 
}

function handleSubmitForm(event) {
	event.preventDefault()		
	clearMessages()				
	const input = document.querySelector('#input-field')
	const inputValue = stripHTML(input.value).trim()		

	if (inputValue != '') {
		addTodo(inputValue)
	}
	input.focus()
	input.value = ''				
}

function handleTodoListButtonClicks(event) {
	const parentItemId = event.target.parentElement.id.replace('item-','')		

	
	switch (event.target.name) {
		case 'btn-check':
			clearMessages()					
			return checkTodo(parentItemId)
		case 'btn-edit':
			clearMessages()
			return editTodo(parentItemId)
		case 'btn-delete':
			clearMessages()
			return deleteTodo(parentItemId)
		default:
			
	}
}

async function handleClearAll(event) {
	
	clearMessages()

	try {
		const allDeletes = todoItems.map( item => fetch(apiUrl + '/tasks/' + item._id, {					
				credentials: 'include',
				method: 'DELETE',
				headers: { Authorization: authToken }
			})
		)
		const allResponses = await Promise.all(allDeletes)				
		if ( !allResponses.every( response => response.ok ) ) {
			allResponses.forEach( response => { 
				if (!response.ok) { console.log('Failed to delete: ' + response.url) } 
			})
			throw "At least one Task was unable to be deleted!"
		}
	} catch (err) {
		message1.textContent = 'ERROR!'
		message2.textContent = err
		message3.textContent = "Unable to DELETE all Tasks!"
		throw message3.textContent
	}
	

	todoItems = []
	let todoList = document.querySelector('#todo-list')
	todoList.innerHTML = ''
	document.querySelector('#instructions').classList.remove('w3-hide')		
	document.querySelector('#btn-clear-all').classList.add('w3-hide')
}

async function handleLogout(event) {
	
	clearMessages()
	try {
		const ignored = await fetch(apiUrl + '/users/logout', {
			credentials: 'include',
			method: 'POST',
			headers: { Authorization: authToken }
		})
	} catch (err) {
		
		message2.textContent = 'Warning: Unable to fully logout!'
		console.log('Error! Unable to POST logout!');
		console.log(err)
	}
	
	setCookie('auth_token', 'deleted', -1)						
	setCookie('task_manager_auth_token', 'deleted', -1)			
	window.location.href = "login.html"
}


async function addTodo(text) {
	let todo = {
		
		description: text,
		completed: false		
	}

	try {
		const response = await fetch(apiUrl + '/tasks', {
			credentials: 'include',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: authToken
			},
			body: JSON.stringify(todo)
		})
		if (response.ok) {
			todo = await response.json()				
		} else {
			throw `Failed Adding Task! ${response.statusText} - ${response.status}`
		}
	} catch (err) {
		message1.textContent = 'ERROR!'
		message2.textContent = err
		message3.textContent = "Unable to POST new Task!"
		console.log(text)
		throw message3.textContent
	}
	todoItems.push(todo)
	updatePageDom(todo)
}

function updatePageDom(todo) {
	
	let todoList = document.querySelector('#todo-list')
	const existingItem = todoList.querySelector(`#item-${todo._id}`)

	
	if (todoItems.length > 0) {
		document.querySelector('#instructions').classList.add('w3-hide')		
		document.querySelector('#btn-clear-all').classList.remove('w3-hide')	
	} else {
		document.querySelector('#instructions').classList.remove('w3-hide')		
		document.querySelector('#btn-clear-all').classList.add('w3-hide')		
	}

	if (todo.deleted) {															
		return existingItem.remove();
	}

	let newListItem = document.createElement('li')
	newListItem.id = `item-${todo._id}`											
	newListItem.classList.add('w3-container')
	newListItem.innerHTML = `<input type="checkbox" name="btn-check" class="w3-check w3-margin-right w3-padding-small w3-large">
		<span name="todo-text">${todo.description}</span>
		<button name="btn-delete" class="w3-right w3-margin-left w3-padding-small sa-no-focus-outline w3-hover-theme w3-border-0 w3-large w3-hover-border-theme"><i class="fa fa-trash-o sa-no-pointer-events"></i></button>
		<button name="btn-edit" class="w3-right w3-margin-left w3-padding-small sa-no-focus-outline w3-hover-theme w3-border-0 w3-large w3-hover-border-theme"><i class="fa fa-pencil sa-no-pointer-events"></i></button>
	`;

	if (todo.completed) {
		newListItem.children['btn-check'].checked = true
		let todoText = newListItem.querySelector(`span`)			
		todoText.classList.toggle('w3-text-grey')
		todoText.classList.toggle('sa-text-line-through')
	}

	if (existingItem) {
		todoList.replaceChild(newListItem, existingItem)
	} else {
		todoList.append(newListItem)
	}
}

async function checkTodo(id) {
	const index = todoItems.findIndex( (item) => item._id == id )

	todoItems[index].completed = !todoItems[index].completed			
	try {
		const response = await fetch(apiUrl + '/tasks/' + todoItems[index]._id, {
			credentials: 'include',
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				Authorization: authToken
			},
			body: JSON.stringify(todoItems[index], ['completed', 'description'])		
		})
		if (response.ok) {
			todoItems[index] = await response.json()
		} else {
			
			throw `Failed Completing Task! ${response.statusText} - ${response.status}`
		}
	} catch (err) {
		message1.textContent = 'ERROR!'
		message2.textContent = err
		message3.textContent = "Unable to PATCH Complete Task! " + todoItems[index]._id
		throw message3.textContent
	}
	updatePageDom(todoItems[index])
}

async function deleteTodo(id) {
	let todo = todoItems.find( (item) => item._id == id )

	try {
		const response = await fetch(apiUrl + '/tasks/' + todo._id, {
			credentials: 'include',
			method: 'DELETE',
			headers: { Authorization: authToken }
		})
		if (response.ok) {
			todo = await response.json()			
		} else {
			throw `Failed Removing Task! ${response.statusText} - ${response.status}`
		}
	} catch (err) {
		message1.textContent = 'ERROR!'
		message2.textContent = err
		message3.textContent = "Unable to DELETE Task! " + todo._id
		throw message3.textContent
	}
	todo.deleted = true													
	todoItems = todoItems.filter( (item) => item._id != id )			
	updatePageDom(todo)
}

async function editTodo(id) {
	const index = todoItems.findIndex( (item) => item._id == id )

	let input = window.prompt("Edit Todo item", todoItems[index].description)
	let inputValue = input ? stripHTML(input).trim() : ''			
	if (inputValue != '' && inputValue != todoItems[index].description) {
		todoItems[index].description = inputValue
		try {
			const response = await fetch(apiUrl + '/tasks/' + todoItems[index]._id, {
				credentials: 'include',
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: authToken
				},
				body: JSON.stringify(todoItems[index], ['completed','description'])			
			})
			if (response.ok) {
				todoItems[index] = await response.json()
			} else {
				throw `Failed Updating Task! ${response.statusText} - ${response.status}`
			}
		} catch (err) {
			message1.textContent = 'ERROR!'
			message2.textContent = err
			message3.textContent = "Unable to PATCH Update Task! " + todoItems[index]._id
			throw message3.textContent
		}
		updatePageDom(todoItems[index])
	}
}
