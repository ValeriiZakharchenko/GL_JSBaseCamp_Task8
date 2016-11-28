var maxNumberHeroes, curHero = 0;

var maxIndexPeople;
var curIndexHero = 1;
var arrAdditionHeaders;

/* Function for check statuse of response from WSAPI.CO
 */
var checkStatus = function (response) {
	if (response.status >= 200 && response.status < 300) {
		return response;
	} else {
		var error = new Error (response.statusText)
		error.response = response;
		throw error;
	}
};

/* Initialization variables and set eventhandlers and view of page.
 */
var init = function () {
	fetch ( `http://swapi.co/api/people/` )
	.then ( checkStatus )
	.then ( function (res) { return res.json() } )
	.then ( function (res) {
		maxNumberHeroes = res.count;
		maxIndexPeople = res.count + 1;
		/* Disable button 'Previous' at start.
		*/
		document.querySelector('button[name=prev]').setAttribute('disabled', 'disabled');
		document.querySelector('button[name=prev]').addEventListener('click', prevHero);
		document.querySelector('button[name=next]').addEventListener('click', nextHero);
		updateBadge();
		/* Adding value of current year in footer.
		 */
		var footerText = (new Date()).getFullYear();
		var textNode = document.createTextNode( `${footerText}` );
		document.querySelector('div.footer').appendChild( textNode );
	})
	.then ( findPeople (curIndexHero) )
	.catch ( function (err) {
			alert ( `Error:${err.status} \n ${err.statusText}` )
	} )
	
}

/* Function searching poeple in SWAPI.CO.
 * parameter - number poeple in list.
 */
var findPeople = function (num) {
	fetch ( `http://swapi.co/api/people/${num}/` )
	.then ( checkStatus )
	.catch ( function (err) {
			alert ( `Error:${err.status} \n ${err.statusText}` )
			throw err;
	} )
	.then ( function (res) { return res.json() } )
	.then ( parseResponsePeople )
	.then ( function (arrFilms) {
		let episode = document.querySelector('.containerEpisode');
		episode.innerHTML = '';
		
		var resArr = '';
		for (let i = 0; i < arrFilms.length; i++ ) {
			fetch ( arrFilms[i] )
			.then ( checkStatus )
			.catch ( function (err) {
					alert ( `Error:${err.status} \n ${err.statusText}` )
					throw err;
			} )
			.then ( function (res) { return res.json() } )
			.then ( function (filmObj) {
				episode.innerHTML +=  `<p>Episode ${filmObj.episode_id}: ${filmObj.title}</p>`;
			})
		}
	})
	.catch ( function (err) {
		alert ( `${err.message}` );
		return -1; 
	} );
}

function parseResponsePeople(infoPeople) {
	let info = infoPeople;
	let infoNode = document.querySelector('.containerInfo');

	if (info.name)			infoNode.children['name'].innerHTML = `Name: ${info.name}`;
	if (info.height)		infoNode.children['height'].innerHTML = `Height: ${info.height/100} m`;
	if (info.mass)			infoNode.children['mass'].innerHTML = `Mass: ${info.mass} Kg`;
	if (info.hair_color)	infoNode.children['hair'].innerHTML = `Hair Color: ${info.hair_color}`;
	if (info.skin_color)	infoNode.children['skin'].innerHTML = `Skin Color: ${info.skin_color}`;
	if (info.eye_color)		infoNode.children['eye'].innerHTML = `Eye Color: ${info.eye_color}`;
	if (info.birth_year)	infoNode.children['birth'].innerHTML = `Birth Year: ${info.birth_year.replace('BBY',' BBY')}`;
	if (info.gender)		infoNode.children['gender'].innerHTML = `Gender: ${info.gender}`;

	return info.films;
}

var updateBadge = function () {
	var will = document.querySelector('.willViewed');
	will.removeChild( will.firstChild );
	will.appendChild ( document.createTextNode( maxNumberHeroes - curHero ) );
	
	var was = document.querySelector('.hadViewed');
	was.removeChild( was.firstChild );
	was.appendChild ( document.createTextNode( curHero ) );
	
}

var nextHero = function () {
	curIndexHero++;
	curHero++;
	updateBadge ();
	
	findPeople(curIndexHero);
	if (document.querySelector("button[name=prev]").hasAttribute('disabled'))		//	If button prew was disabled - enable it.
		document.querySelector("button[name=prev]").removeAttribute('disabled');
	else if (curIndexHero === maxIndexPeople)										//	Curren hero is last - disable the next buton.
		document.querySelector('button[name=next]').setAttribute('disabled', 'disabled');
}

var prevHero = function () {
	curIndexHero--;
	curHero--;
	updateBadge ();
	
	findPeople(curIndexHero);
	if (document.querySelector("button[name=next]").hasAttribute('disabled'))		//	if button next was disabled - enable it.
		document.querySelector("button[name=next]").removeAttribute('disabled')
	else if (curIndexHero === 1) {													//	Current hero is first.
		document.querySelector('button[name=prev]').setAttribute('disabled', 'disabled');
	}
}

init();