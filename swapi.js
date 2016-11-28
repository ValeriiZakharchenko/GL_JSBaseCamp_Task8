var maxIndexPeople;
var curIndexHero = 1, curHero = 0, maxNumberHeroes;
var arrAdditionHeaders;
var listFilmsRequest = [];		// List of request which take films info.

//document.addEventListener("DOMContentLoaded", init);

/* Init environment take and display information about first people in list.
 */
function init() {
	/* Adding value of current year in footer.
	 */
	var footerText = (new Date()).getFullYear();
	var textNode = document.createTextNode( `${footerText}` );
	document.querySelector('div.footer').appendChild( textNode );
	/* Disable button 'Previous' at start.
	*/
	document.querySelector('button[name=prev]').setAttribute('disabled', 'disabled');
	document.querySelector('button[name=prev]').addEventListener('click', prevHero);
	document.querySelector('button[name=next]').addEventListener('click', nextHero);
	
	/* Take info about maximum index of poeple in list
	 */
	var xhri = new XMLHttpRequest();
	xhri.open('GET', `http://swapi.co/api/people/`, true);
	xhri.onreadystatechange = function () { 
			if (xhri.readyState === 4) {
				if (xhri.status === 200) {
					var res = JSON.parse (xhri.responseText);
					maxNumberHeroes = res.count;
					maxIndexPeople = res.count + 1;
				} else {
					alert(`Error: ${xhri.status} \n ${xhri.responseText} `);
				}
			}
	}
	xhri.setRequestHeader('Content-type', 'application/json; charset=utf-8');
	xhri.send();
	
	findPeople (curIndexHero);
}
/* Update number in badge in button 'next', 'previous'
 * Function invoke by these buttons.
 */
function updateBadge () {
	var will = document.querySelector('.willViewed');
	will.removeChild( will.firstChild );
	will.appendChild ( document.createTextNode( maxNumberHeroes - curHero ) );
	
	var was = document.querySelector('.hadViewed');
	was.removeChild( was.firstChild );
	was.appendChild ( document.createTextNode( curHero ) );
}

/* Init request for taking info about previous poeple.
 * The function invoke function 'findPeople' and updepe buttons.
 */
function nextHero () {
	curIndexHero++;
	curHero++;
	updateBadge ();
	
	findPeople ( curIndexHero );
	if (document.querySelector("button[name=prev]").hasAttribute('disabled'))		//	If button prew was disabled - enable it.
		document.querySelector("button[name=prev]").removeAttribute('disabled');
	else if (curIndexHero === maxIndexPeople)										//	Curren hero is last - disable the next buton.
		document.querySelector('button[name=next]').setAttribute('disabled', 'disabled');
}

/* Init request for taking info about next poeple.
 * The function invoke function 'findPeople' and updepe buttons.
 */
function prevHero () {
	curIndexHero--;
	curHero--;
	updateBadge ();

	findPeople ( curIndexHero );
	if (document.querySelector("button[name=next]").hasAttribute('disabled'))		//	if button next was disabled - enable it.
		document.querySelector("button[name=next]").removeAttribute('disabled')
	else if (curIndexHero === 1) {													//	Current hero is first.
		document.querySelector('button[name=prev]').setAttribute('disabled', 'disabled');
	}
}

/* Input parameter - number - index of people in list of heroes in films.
 * Function send request on swapi.co to take info about the people.
 * Invoke function 'parseResponsePeople' to displaying info.
 */
function findPeople ( num ) {
	var xhr = new XMLHttpRequest ();
	xhr.open('GET', `http://swapi.co/api/people/${num}/`, true);
	try {
		xhr.onreadystatechange = function () { 
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					parseResponsePeople ( xhr.responseText );
				}
				else if (xhr.status === 404) {
					alert (`In function 'findPeople' occurs Error: ${xhr.status} \n ${xhr.statusText} `);
				}
			}
		}
		xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
		xhr.send();
	}
	catch (err) {
		alert (`In function 'findPeople' \nError: ${err.name} ${err.message}`);
	}
}

/* Input parameter - JSON object whith people's  information.
 * Function parse the object, display info about people in section '.containerInfo'
 * invoke function 'findFilms' for taking info about films whith the people.
 */
function parseResponsePeople ( infoPeople ) {
	let info = JSON.parse( infoPeople );
	let infoNode = document.querySelector('.containerInfo');
	
	if (info.name)			infoNode.children['name'].innerHTML = 	`Name: ${info.name}`;
	if (info.height)		infoNode.children['height'].innerHTML = `Height: ${info.height/100} m`;
	if (info.mass)			infoNode.children['mass'].innerHTML = 	`Mass: ${info.mass} Kg`;
	if (info.hair_color)	infoNode.children['hair'].innerHTML = 	`Hair Color: ${info.hair_color}`;
	if (info.skin_color)	infoNode.children['skin'].innerHTML = 	`Skin Color: ${info.skin_color}`;
	if (info.eye_color)		infoNode.children['eye'].innerHTML = 	`Eye Color: ${info.eye_color}`;
	if (info.birth_year)	infoNode.children['birth'].innerHTML =	`Birth Year: ${info.birth_year.replace('BBY',' BBY')}`;
	if (info.gender)		infoNode.children['gender'].innerHTML =	`Gender: ${info.gender}`;
	
	findFilms (info.films );
}

/* Input parameter array of links to information about films.
 * Search info about films and display in section '.containerEpisode'.
 */
function findFilms ( arr ) {
	let episode = document.querySelector('.containerEpisode');
	episode.innerHTML = '';
	//let crawler = [];
	
	/* Cancel previous requests and clear array of this request if it's not done.
	 */
	for (let i = 0; i < listFilmsRequest.length; i++) {
		listFilmsRequest[i].abort();
	}
	listFilmsRequest = [];
	
	/* Genera request about films, parse response, 
	 * appending paragraph whith info in section '.containerEpisode' when done.
	 */
	for (let i = 0, len = arr.length; i < len; i++) {
		let x = new XMLHttpRequest ();
		listFilmsRequest.push ( x );
		x.open('GET', arr[i], true )
		x.onreadystatechange = function () { 
			if (x.readyState === 4) {
				if (x.status === 200) {
					let filmObj = JSON.parse (x.responseText);
					episode.innerHTML += `<p>Episode ${filmObj.episode_id}: ${filmObj.title}</p>`;
					//crawler.push( filmObj.opening_crawl );
				} else if (x.status === 404) {
					alert(`In function 'findFilms'
						Error: ${xhr.status}, xhr.readyState = ${xhr.readyState}
						xhr.responseText = ${xhr.responseText} `);
				}
			}
		}
		x.setRequestHeader ('Content-type', 'application/json; charset=utf-8');
		x.send ();
	}
}

window.onload = init;