let maxNumberHeroes, curHero = 0;

let maxIndexPeople;
let curIndexHero = 1;
let arrAdditionHeaders;

/* Function for check statuse of response from WSAPI.CO
 */
let checkStatus = function chs(response) {
	if (response.status == 200) { // >= 200 && response.status < 300) {
		return response;		// Response will wrapped in Promise. Equal:
								// return Promise.resolve (response);
	} else {
		let error = new Error (response.statusText)
		error.response = response;
		throw error;					// Response will wrapped in Promise.reject
	}
};

/* Initialization variables and set eventhandlers and view of page.
 */
const init = function i() {
	/* Disable button 'Previous' at start.
	*/
	document.querySelector('button[name=prev]').setAttribute('disabled', 'disabled');
	document.querySelector('button[name=prev]').addEventListener('click', prevHero);
	document.querySelector('button[name=next]').addEventListener('click', nextHero);
	/* Adding value of current year in footer.
	 */
	let footerText = (new Date()).getFullYear();
	let textNode = document.createTextNode( `${footerText}` );
	document.querySelector('div.footer').appendChild( textNode );
	
	fetch ( `http://swapi.co/api/people/` )
	.then ( checkStatus )
	.then ( function (res) { return res.json() } )
	.then ( function (res) {
		maxNumberHeroes = res.count;
		maxIndexPeople = res.count + 1;
		// Actualizing badge value.
		updateBadge();
	})
	.then ( findPeople (curIndexHero) )
	.catch ( function (err) {
			alert ( `Error:${err.status} \n ${err.statusText}` )
	} );
};

/* Parse info about hero.
 * Parameter:
 * 'infoPeople' - object.
 * Return:
 * array of link to films whith the hero.
 */
const parseResponsePeople = function prp(infoPeople) {
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
};

/* Search people in SWAPI.CO 
 * and display info about them.
 * Parameter:
 * 'num' - index of people in list.
 */
const findPeople = function fp(num) {
	fetch ( `http://swapi.co/api/people/${num}/` )
	.then ( checkStatus )
	.catch ( function (err) {
			//alert ( `Error:${err.status} \n ${err.statusText}` )
			throw err;
	} )
	.then ( function (res) { return res.json() } )
	.then ( parseResponsePeople )
	.then ( function (arrFilms) {
		animationStart();							// Start animation in container for films
		return Promise.all( arrFilms.map( 			// For every film's link fetch info
			(film) => { return fetch(film)
								.then ( checkStatus )
								.then ( (res) => {return res.json()} )
					  }
		) )
	} )
	.then ( function (arrFilmsObj) {				// Display film's information
		let episode = document.querySelector('.containerEpisode');
		let resTxt = [];
		arrFilmsObj.map (
			(filmObj) => {
				resTxt.push ( `Episode ${filmObj.episode_id}: ${filmObj.title}` );
			} 
		)
		
		animationStop();							// Clear container from animation
		episode.innerHTML = '<p>' + resTxt.join('</p><p>') + '</p>';
	} )
	.catch ( function (err) {
		// Stop animation if error happens after start animation 
		// on stage fetching info about films or later
		if ( document.querySelector('.containerEpisode .anim') ) {
			animationStop();
		}
		alert ( `${err.message}` );
		return -1;
	} );
};

/* Update value of badges
 * on buttons 'Next' and 'Previous.
 */
const updateBadge = function ub() {
	var will = document.querySelector('.willViewed');
	will.removeChild( will.firstChild );
	will.appendChild ( document.createTextNode( maxNumberHeroes - curHero ) );
	
	var was = document.querySelector('.hadViewed');
	was.removeChild( was.firstChild );
	was.appendChild ( document.createTextNode( curHero ) );
};

/* Handler click button 'Next'.
 * Change indexes of heroes, update value of badges on button,
 * send request about next hero,
 * if last hero - disable button 'Next'.
 */
const nextHero = function nh() {
	curIndexHero++;
	curHero++;
	updateBadge ();
	
	findPeople(curIndexHero);
	if (document.querySelector("button[name=prev]").hasAttribute('disabled'))		//	If button prew was disabled - enable it.
		document.querySelector("button[name=prev]").removeAttribute('disabled');
	else if (curIndexHero === maxIndexPeople)										//	Curren hero is last - disable the next buton.
		document.querySelector('button[name=next]').setAttribute('disabled', 'disabled');
};

/* Handler click button 'Previous'.
 * Change indexes of heros, update value of badges on button,
 * send request about previous hero,
 * if first hero - disable button 'Previous'.
 */
const prevHero = function ph() {
	curIndexHero--;
	curHero--;
	updateBadge ();
	
	findPeople(curIndexHero);
	if (document.querySelector("button[name=next]").hasAttribute('disabled'))		//	if button next was disabled - enable it.
		document.querySelector("button[name=next]").removeAttribute('disabled')
	else if (curIndexHero === 1) {													//	Current hero is first.
		document.querySelector('button[name=prev]').setAttribute('disabled', 'disabled');
	}
};

/* Build animation in specified node.
 * Parameter:
 * 'nod' - in this node have to build animation. By default '.containerEpisode'.
 */
const animationStart = function astr( nod = document.querySelector('.containerEpisode') ) {
	while (nod.lastChild) {
		nod.removeChild(nod.lastChild);
	}
	const divNode = document.createElement('div');
	divNode.classList.add('anim');
	nod.appendChild(divNode);
};

/* Remove animation from node.
 * Parameter:
 * 'nod' - from this node have to delete animation. By default '.containerEpisode'.
 */
const animationStop = function astp( nod = document.querySelector('.containerEpisode') ) {
	try {
		const divNode = document.querySelector('.containerEpisode .anim');
		nod.removeChild(divNode);
	}
	catch (err) {
		//alert ("Animation cant be removed.\nProbably you click navigation button to fast.\nError: " + err.message);
	}
};

/* BEGIN of biulding site!
 */
init();