const path = document.location.pathname.split('/');
const user = path[path.length - 1];
window.meals = [];
window.date = new Date();
document.getElementById('date').innerHTML = window.date.toISOString().split('T')[0];
window.saveTimeout;

function changeGoal() {
    const newCals = prompt("Please enter your new goal calories:", "2000");
    if (newCals == null || newCals == "") {
        console.log("no change");
    } else {
        window.goal = newCals;
        fetch(`/api/change/${user}`, {
                method: 'POST',
                body: JSON.stringify({
                    user: user,
                    goal: window.goal
                }),
                headers: {
                    'Content-Type': 'application/json',
                },

            })
            .then(response => {
                if (response.status == 200) {
                    document.getElementById('end').innerHTML = window.goal;
                }
            })
    }
    renderGoalBar();
}

function addMeal(e) {
    const name = document.querySelector('#mealName').value;
    const cals = document.querySelector('#calories').value;
    if (name && cals) {
        fetch(`/api/add/${user}`, {
                method: 'POST',
                body: JSON.stringify({
                    name: name,
                    cals: cals,
                    date: window.date
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            })
        return false;
    } else {
        alert("Whoops, try that again with proper input!");
    }
}

function renderList() {
    const date = window.date;
    if (window.date.toISOString().split('T')[0] == new Date().toISOString().split('T')[0]) {
      document.getElementById('date').innerHTML = 'Today';
    }
    const list = document.querySelector('#list-foods');

    list.querySelectorAll('li').forEach(item => {
        item.remove()
    });
    window.meals.filter(meal => {
            meal = new Date(meal.date);
            return date.toISOString().split('T')[0] === meal.toISOString().split('T')[0];
        })
        .forEach(meal => {
            list.innerHTML += `<li id='${meal.id}' class='new-item'  oninput='saveEdit(this)'><p class='name' contentEditable ='true'>${meal.name} </p><p class='cals' contentEditable ='true'> ${meal.cals} </p><button class = 'delMeal button is-rounded' onclick = 'delMeal(this)'> <i class="fas fa-times"></i> </button> </li>`;
        });
    renderGoalBar();
}


function renderGoalBar() {
    const list = document.querySelector('#list-foods');
    if (list.length !== 0) {
        let total = 0;
        list.querySelectorAll('li').forEach(item => {
            total += parseInt(item.querySelector('.cals').innerHTML)
        });
        document.getElementById('totalCals').innerHTML = total;
        let percent = (total / window.goal) * 100;
        if (percent <= 100) {
            document.getElementById('progress').value = percent;
            document.getElementById('progress').classList.remove('is-danger');
            document.getElementById('progress').classList.add('is-success');
        } else {
            document.getElementById('progress').value = 100;
            document.getElementById('progress').classList.remove('is-success');
            document.getElementById('progress').classList.add('is-danger');
        }
    }
}

function saveEdit(elem) {
    const elemId = elem.id;
    const list = document.querySelector('#list-foods');
    let li = document.getElementById(`${elemId}`);
    clearTimeout(window.saveTimeout);
    let snackbar = document.getElementById("snackbar");
    snackbar.className = "show";
    window.saveTimeout = setTimeout(function() {
        const cals = li.querySelector(".cals").innerHTML;
        const name = li.querySelector(".name").innerHTML;
        const id = elemId;
        fetch(`/api/edit/${user}`, {
                method: 'POST',
                body: JSON.stringify({
                    user: user,
                    id: id,
                    name: name,
                    cals: cals
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(response => {
                if (response.status == 200) {
                    if (list.length !== 0) {
                        let total = 0;
                        list.querySelectorAll('li').forEach(item => {
                            total += parseInt(item.querySelector('.cals').innerHTML)
                        });
                        document.getElementById('totalCals').innerHTML = total;
                        setTimeout(function() {
                            snackbar.className = snackbar.className.replace("show", "");
                        }, 1500);
                        const percent = (total / window.goal) * 100;
                        document.getElementById('progress').value = percent;

                    }
                }
            })
    }, 500);
}

function move(direction) {
    if (direction) {
        window.date.setDate(window.date.getDate() + direction);
        document.getElementById('date').innerHTML = window.date.toISOString().split('T')[0];
    } else {
        window.date = new Date();
        document.getElementById('date').innerHTML = window.date.toISOString().split('T')[0];
    }
    renderList();
}

function showForm() {
    document.querySelector('.modal').classList.add('is-active');
    document.getElementById('showForm').style.display = 'none';
}

window.onclick = function(event) {
if (event.target === document.querySelector('.modal-background')) {
    modalClose()
  }
}

function modalClose() {
    document.querySelector('.modal').classList.remove('is-active');
    document.getElementById('showForm').style.display = 'inline-block';
};

function delMeal(elem) {
    const delId = elem.parentNode.id;
    fetch(`/api/delete/${user}`, {
            method: 'DELETE',
            body: JSON.stringify({
                id: delId
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if (response.status == 200) {
                let li = document.getElementById(`${delId}`);
                let calories = parseInt(li.querySelector(".cals").innerHTML);
                let total = parseInt(document.getElementById('totalCals').innerHTML);
                document.getElementById('totalCals').innerHTML = total - calories;

                // Animation and keeping alternate colors intact
                const keepColor = window.getComputedStyle(li).backgroundColor;
                li.classList.add('removed-item');
                const deleted = li.cloneNode(true);
                deleted.style.backgroundColor = keepColor;
                li.parentElement.appendChild(deleted);
                li.remove();

                // Update progress bar
                let percent = ((total - calories) / window.goal) * 100;
                document.getElementById('progress').value = percent;
                
                // Remove from browser state
                window.meals = window.meals.filter(m => m.id != delId);
            }
        })
}

function loadMeals() {
    fetch(`/api/get/${user}`)
        .then((response) => {
            return response.json();
        })
        .then((meals) => {
            window.meals = meals;
            renderList();
        })
        .catch(err => console.error(err));
}

function loadUser() {
    fetch(`/api/info/${user}`)
        .then((response) => {
            return response.json();
        })
        .then(user => {
            window.goal = user.goal;
            document.getElementById('end').innerHTML = window.goal;
            document.getElementById('welcome'). innerHTML = `Welcome <strong>${path[path.length - 1]}</strong>!`
            loadMeals();
        })
        .catch(err => console.error(err));
}

loadUser();