const path = document.location.href;
window.date = new Date();

register();

document.querySelector('#change-username').onclick = function() {
    register();
};

function copy() {
    let copyText = document.getElementById("user-link");
    copyText.select();
    document.execCommand("copy");
}

function register() {
    fetch('/api/register')
        .then(function(response) {
            return response.json();
        })
        .then(function(myJson) {
            let user = myJson.user;
            let redirectUrl = path + 'dashboard/' + user;
            document.querySelector('#username').innerHTML = user;
            document.querySelector('#user-link-btn').onclick = function() {
                location.href = redirectUrl;
            };
            document.querySelector('#demo-btn').onclick = function() {
                let d = new Date();
                let yesterday = d.setDate(d.getDate() - 1);
                yesterday = new Date(yesterday).toISOString();
               
                let autoMeals = buildDemoMeals(user, yesterday);
                for (let i = 0; i < autoMeals.length; i++) {
                    let obj = autoMeals[i];
                    fetch(`/api/add/${user}`, {
                            method: 'POST',
                            body: JSON.stringify({
                                user: obj.user,
                                id: obj.id,
                                name: obj.name,
                                cals: obj.cals,
                                date: obj.date
                            }),
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        })
                        .then(response => {
                          let demoURL = path + 'demo/' + user;
                          location.href = demoURL;
                    })
                };
            };
        });
}

function buildDemoMeals(user, yesterday) {
  return [{
                        id: 1,
                        user: `${user}`,
                        name: "Example Hamburger (click to edit!)",
                        cals: 500,
                        date: `${window.date}`
                    },
                    {
                        id: 2,
                        user: `${user}`,
                        name: "Example Side Salad (try deleting me!)",
                        cals: 100,
                        date: `${window.date}`
                    },
                    {
                        id: 3,
                        user: `${user}`,
                        name: "Example French Fries",
                        cals: 450,
                        date: `${window.date}`
                    },
                    {
                        id: 4,
                        user: `${user}`,
                        name: "Smoked Salmon",
                        cals: 250,
                        date: `${yesterday}`
                    },
                    {
                        id: 4,
                        user: `${user}`,
                        name: "Bagel",
                        cals: 300,
                        date: `${yesterday}`
                    }
                ];
}