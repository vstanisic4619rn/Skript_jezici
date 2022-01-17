var str = document.cookie.substring(document.cookie.indexOf("<") + 1, document.cookie.lastIndexOf(">"));
const cookies = str.split(',');
const userId = cookies[0];
const userName = cookies[1];
const isAdmin = cookies[2] === '1';
const token = cookies[cookies.length - 1];

function init() {
    fetch('http://127.0.0.1:8000/api/users', {
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then( res => res.json() )
        .then( data => {
            const lst = document.getElementById('usrLst');
            isAdmin && data[0].forEach(el => {
                lst.innerHTML += `<li>ID: ${el.id}, Name: ${el.username}</li>`;
            });
        });-

    fetch('http://127.0.0.1:8000/api/messages', {
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then( res => res.json() )
        .then( data => {
            const lst = document.getElementById('msgLst');
            isAdmin && data.forEach( el => {
                console.log(el);
                fetch('http://127.0.0.1:8000/api/getusername', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({user_id: el.user_id})
                    })
                    .then( res => res.json() )
                    .then( curUserName => {
                        lst.innerHTML += `<li>ID: ${el.id}, Recenzija: ${el.body}, User: ${curUserName[0].username}</li>`;
                    })
              
            });
        });

    fetch('http://127.0.0.1:8000/api/products', {
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then( res => res.json() )
            .then( data => {
                const lst = document.getElementById('productList');
                !isAdmin && data[0].forEach( el => {
            
                    lst.innerHTML += `<div class="col-md-6 mb-2"><a href="?pid=${el.id}" class="btn btn-success w-100">${el.product_name}</a></div>`;
                });
            });



    document.getElementById('msgBtn').addEventListener('click', e => {
        e.preventDefault();
        var url_string = window.location.href;
        var url = new URL(url_string);
        var productID = url.searchParams.get("pid");
        if (!productID){
            alert('Select product first!');
        }
        const data = {
            user_id: userId,
            product_id: productID,
            body: document.getElementById('body').value,
            posted_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
            last_update: new Date().toISOString().slice(0, 19).replace('T', ' '),
        };
        fetch('http://127.0.0.1:8000/api/add_comment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then( res => res.json() )
        .then( el => {
            if (el.msg) {
                alert(el.msg);
            } else {
                document.getElementById('msgLst').innerHTML += `<li>ID: ${el.id}, Body: ${el.body}</li>`;
            }
        });
    });

    document.getElementById('logout').addEventListener('click', e => {
        document.cookie = `token=;SameSite=Lax`;
        window.location.href = '/login';
    });
}