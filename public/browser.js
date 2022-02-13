const config = {
    headers: {
        "content-type": "application/json",
    },
};

let skip = 0;

document.querySelectorAll(".edit").forEach((item) => {
    item.addEventListener("click", function (event) {
        // console.log(
        //   this.parentElement.parentElement.querySelector(".name").innerHTML
        // );
        let NewuserName = prompt("Enter your new user name");
        let NewuserEmail = prompt("Enter your new Email");
        let NewuserPhone = prompt("Enter your new Phone");

        if (NewuserName || NewuserEmail || NewuserPhone) {
            let body = JSON.stringify({
                id: this.getAttribute("id"),
                newData: {
                    userName: NewuserName,
                    userEmai: NewuserEmail,
                    userPhone: NewuserPhone,
                },
            });

            axios
                .post("/edit-item", body, config)
                .then((res) => {
                    if (res.status == 200) {
                        // (this.innerText = NewuserName),
                        //   (this.innerText = NewuserEmail),
                        //   (this.innerText = NewuserPhone);

                        event.target.parentElement.parentElement.querySelector(
                            ".name"
                        ).innerHTML = NewuserName;
                        event.target.parentElement.parentElement.querySelector(
                            ".email"
                        ).innerHTML = NewuserEmail;
                        event.target.parentElement.parentElement.querySelector(
                            ".phone"
                        ).innerHTML = NewuserPhone;
                    } else {
                        alert("Updation Failed");
                    }
                })
                .catch((err) => {
                    console.log(err);
                    alert("Updation failed");
                });
        }
    });
});

document.querySelectorAll(".delete").forEach((item) => {
    item.addEventListener("click", function (event) {
        if (confirm("Do You want to delete the todo")) {
            let body = JSON.stringify({
                id: event.target.getAttribute("id"),
            });

            axios.post("/delete-item", body, config)
                .then((res) => {
                    if (res.status == 200) {
                        event.target.parentElement.parentElement.remove();
                    } else {
                        alert("Delete Unsuccessful");
                    }
                })
                .catch((err) => {
                    alert("Delete Unsuccessful");
                });
        }
    });
});

window.onload = function() {
    axios.post(`/pagination_dashboard?skip=${skip}`, JSON.stringify({}), config)
    .then((res) => {
        
        if(res.status != 200) {
            alert('An error occured. Please try again');
            return;
        }

        const todoItems = res.data.data[0].data;
        // console.log(todoItems);

        document.getElementById("item_list").insertAdjacentHTML('beforeend', todoItems.map((todo) => {
            return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
                    <span class="item-text"> ${todo.todo} </span>
                    <div>
                    <button data-id="${todo._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
                    <button data-id="${todo._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
                    </div>
                </li>`
        }).join(''));
        
        skip += todoItems.length;

    }).catch(err => {
        alert('Not able to fetch todos. Please try again.')
    }) 
}