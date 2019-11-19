import './assets/styles/main.scss'
import './assets/static/cars.json'

// use a proxy to avoid CORS issue, just for test purpose.
// just in case site that doesn’t send Access-Control-*
// format: https://cors-anywhere.herokuapp.com/https://example.com
const proxyurl = "https://cors-anywhere.herokuapp.com/";
const liveApiURi = "https://www.cartrawler.com/ctabe/cars.json";


// local URi served with python http server mainly to resolve CORS issue
// python3 server.py
const localApiURi = 'http://0.0.0.0:3000/src/assets/static/cars.json'
const liveApiURiwithProxy = `${proxyurl}${liveApiURi}`

// replace liveApiURiwithProxy here
fetch(liveApiURiwithProxy)
    .then(response => response.json())
    .then(dataJson => {
        const bookInfo = dataJson[0]['VehAvailRSCore']['VehRentalCore']
        const cars = dataJson[0]['VehAvailRSCore']['VehVendorAvails']
        renderBookingInfoForm(bookInfo)
        renderListing(cars)
    })
    .catch((err) => { throw new Error(err) });


const renderBookingInfoForm = (bookInfo) => {
    const pick_location_name = bookInfo['PickUpLocation']['@Name']
    const drop_location_name = bookInfo['ReturnLocation']['@Name']

    // split ISOString by 'T' to get date
    const pickDate = bookInfo['@PickUpDateTime'].split('T')[0]
    const dropDate = bookInfo['@ReturnDateTime'].split('T')[0]

    // use legend to display info
    let fieldset = document.createElement('fieldset');
    let legend = document.createElement('legend')
    legend.innerHTML = 'Booking Information'
    let pickInputTag = document.createElement('input')
    pickInputTag.value = pick_location_name
    let pickLocationLabel = document.createElement("label");
    pickLocationLabel.innerHTML = 'PICK-UP LOCATION: '
    pickLocationLabel.appendChild(pickInputTag);
    let dropInputTag = document.createElement('input')
    dropInputTag.value = drop_location_name
    let dropLocationLabel = document.createElement("label");
    dropLocationLabel.innerHTML = 'DROP-OFF LOCATION: '
    dropLocationLabel.appendChild(dropInputTag);


    // appendChild
    fieldset.appendChild(legend);
    fieldset.appendChild(pickLocationLabel)
    fieldset.appendChild(dropLocationLabel)

    let gridContainer = document.createElement("div");
    gridContainer.className = 'grid-container'
    let pickDateLabel = document.createElement("label");
    pickDateLabel.innerHTML = 'PICK-UP DATE: '
    let pickDateInput = document.createElement('input')
    pickDateInput.value = pickDate
    pickDateLabel.appendChild(pickDateInput);

    let selectedPickTime = document.createElement('select')
    let selectedPickTimeOption = document.createElement("option");
    selectedPickTimeOption.value = '10:00';
    selectedPickTimeOption.text = '10:00';
    selectedPickTime.appendChild(selectedPickTimeOption);


    let dropDateLabel = document.createElement("label");
    dropDateLabel.innerHTML = 'DROP-OFF DATE: '
    let dropDateInput = document.createElement('input')
    dropDateInput.value = dropDate
    dropDateLabel.appendChild(dropDateInput);

    let selectedDropTime = document.createElement('select')
    let selectedDropTimeOption = document.createElement("option");
    selectedDropTimeOption.value = '10:00';
    selectedDropTimeOption.text = '10:00';
    selectedDropTime.appendChild(selectedDropTimeOption);


    // appendChild
    gridContainer.appendChild(pickDateLabel)
    gridContainer.appendChild(selectedPickTime)
    gridContainer.appendChild(document.createElement('br'))
    gridContainer.appendChild(dropDateLabel)
    gridContainer.appendChild(selectedDropTime)
    fieldset.appendChild(gridContainer)

    // append fieldset to search form
    document.getElementById('SearchForm').appendChild(fieldset);
}


// sort function 
const select = document.getElementById("sort-item"),
    showOption = document.querySelector('#option-selected');

// add event handler if value changes
select.addEventListener('change', () => {
    showOption.textContent = "selected " + this.value;
});

/**
 * render main listing component
*/

const renderListing = (cars) => {
    const totalCars = getTotal(cars)
    // sort by price (low to high) as default
    totalCars.sort((a, b) => parseFloat(a['TotalCharge']['@RateTotalAmount']) - parseFloat(b['TotalCharge']['@RateTotalAmount']))
    // render single table
    rederSingleView(totalCars)
}

// render single table
let rederSingleView = (totalCars) => {
    // this modal flag needs to be passed to render view in modal container
    let isModal = false;
    totalCars.forEach((singleCar, idx) => {
        // add modal for every single table
        let modalBtn = document.createElement('button')
        modalBtn.id = `showModel${idx}`
        modalBtn.className = `btn${idx} card_btn`
        modalBtn.innerHTML = 'Show Details'

        let table_right_inner_td2 = document.createElement('td')
        table_right_inner_td2.appendChild(modalBtn)
        let content_container = document.getElementById('content-listing')
        // render single table
        renderSingleTable(singleCar, table_right_inner_td2, content_container, isModal)

        // add modal function and addEventListener
        let showModalBtn = document.getElementById(`showModel${idx}`);
        let close = document.getElementsByClassName('close')[0];
        let cancel = document.getElementById('cancel');
        let modal = document.getElementById('modal');

        showModalBtn.addEventListener('click', () => {
            modal.style.display = "block";
            // pass current car data to modal
            renderModal(singleCar)
        });
        close.addEventListener('click', () => {
            modal.style.display = "none";
        });
        cancel.addEventListener('click', () => {
            modal.style.display = "none";
        });
    })
}


let renderSingleTable = (singleCar, table_right_inner_td2, mainContainer, isModal) => {
    if (isModal) {
        const modalContentNode = document.getElementById("modal-content");
        while (modalContentNode.firstChild) {
            modalContentNode.removeChild(modalContentNode.firstChild);
        }
    }
    // console.log(TotalCharge)
    let Vehicle = singleCar['Vehicle']

    let table = document.createElement('table')
    let table_tr = document.createElement('tr')
    table.appendChild(table_tr)
    let table_left = document.createElement('th')
    let table_mid = document.createElement('th')
    let table_right = document.createElement('th')
    table_tr.appendChild(table_left)
    table_tr.appendChild(table_mid)
    table_tr.appendChild(table_right)
    let carImg = document.createElement('img')
    // console.log(Vehicle['PictureURL'])
    carImg.src = Vehicle['PictureURL']
    table_left.appendChild(carImg)


    let table_mid_inner = document.createElement('table')
    let table_mid_inner_tbody = document.createElement('tbody')
    table_mid_inner.appendChild(table_mid_inner_tbody)
    table_mid.appendChild(table_mid_inner)
    let table_mid_inner_tr = document.createElement('tr')
    table_mid_inner_tbody.appendChild(table_mid_inner_tr)


    // need to deep copy original object instead of shallow copy,
    // so origin object wont be affected if modify items in new copied object
    let deepCopiedVehicle = deepCopy(Vehicle)
    delete deepCopiedVehicle['PictureURL']
    delete deepCopiedVehicle['VehMakeModel']
    delete deepCopiedVehicle['@CodeContext']
    // console.log(deepCopiedVehicle)
    Object.keys(deepCopiedVehicle).forEach(obj => {
        let txt = document.createElement('p');
        txt.innerHTML = `${obj.replace('@', '').trim()} : ${deepCopiedVehicle[obj]}`;
        table_mid_inner_tr.appendChild(txt);
    })
    let table_right_inner = document.createElement('table')
    table_right_inner.className = 'tb-right'
    let table_right_inner_tbody = document.createElement('tbody')
    table_right_inner.appendChild(table_right_inner_tbody)
    table_right.appendChild(table_right_inner)
    let table_right_inner_tr = document.createElement('tr')
    table_right_inner_tbody.appendChild(table_right_inner_tr)


    let table_right_inner_td = document.createElement('td')
    let table_right_inner_td_span = document.createElement('span')
    // table_right_inner_td_span.innerHTML = singleCar['TotalCharge']['@EstimatedTotalAmount']
    table_right_inner_td_span.innerHTML = `${singleCar['TotalCharge']['@EstimatedTotalAmount']} ${singleCar['TotalCharge']['@CurrencyCode']}`

    table_right_inner_td.appendChild(table_right_inner_td_span)
    table_right_inner_tr.appendChild(table_right_inner_td)
    table_right_inner_tr.appendChild(table_right_inner_td2)
    mainContainer.appendChild(table);
}

let getTotal = (cars) => {
    let total_available_cars = []
    cars.map(car => car['VehAvails'].forEach(vehAvail => total_available_cars.push(Object.assign(vehAvail, car['Vendor']))))
    return total_available_cars
}


let renderModal = (currentCar) => {
    // isModal === true if render modal content
    let isModal = true
    // retrieve currentCar
    let table_right_inner_td2 = document.createElement('td')
    let modalContent = document.getElementById('modal-content')
    renderSingleTable(currentCar, table_right_inner_td2, modalContent, isModal)
}


/** helper function
 *  1. check target type
 *  2. deep copy of object or array
 *  3. debounce function to reduce the number of function or api calls
 */

// check target type
let checkedType = (target) => {
    return Object.prototype.toString.call(target).slice(8, -1)
}

// deepCopy object or array
let deepCopy = (target) => {
    let result, targetType = checkedType(target)
    if (targetType === 'Object') {
        result = {}
    } else if (targetType === 'Array') {
        result = []
    } else {
        return target
    }
    for (let i in target) {
        let value = target[i]
        checkedType(value) === 'Object' || checkedType(value) === 'Array' ? result[i] = deepCopy(value) : result[i] = value;
    }
    return result
}

// immediate: true || false, reduce the number of function calls, only call function after user input stops
let debounce = (fn, wait, immediate) => {
    let timeout;
    let debounced = () => {
        let context = this;
        let args = arguments;
        if (timeout) clearTimeout(timeout);
        let callNow = !timeout;
        if (immediate) {
            // if excute already, then no need to excute again
            timeout = setTimeout(() => {
                timeout = null;
            }, wait);
            if (callNow) fn.apply(context, args);
        } else {
            timeout = setTimeout(() => {
                fn.apply(context, args);
            }, wait);
        }
    };
    debounced.cancel = () => {
        clearTimeout(timeout);
        timeout = null;
    };
    return debounced
}

let search = document.querySelector("#search");
let showSearch = document.querySelector("#showSearch");
let getSearchInfo = (e) => {
    // showSearch.innerText = this.value; 
    //  console.log(e); // undefined
    showSearch.innerText = search.value;
}
search.onkeyup = debounce(getSearchInfo, 500);