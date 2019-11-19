/* global fetch:false */

import './assets/styles/main.scss'
import './assets/static/cars.json'

// use a proxy to avoid CORS issue, just for test purpose.
// just in case site that doesn’t send Access-Control-*
// format: https://cors-anywhere.herokuapp.com/https://example.com
const proxyurl = 'https://cors-anywhere.herokuapp.com/'
const liveApiURi = 'https://www.cartrawler.com/ctabe/cars.json'

// local URi served with python http server mainly to resolve CORS issue
// python3 server.py
const localApiURi = 'http://0.0.0.0:3000/src/assets/static/cars.json'
const liveApiURiwithProxy = `${proxyurl}${liveApiURi}`

// replace liveApiURiwithProxy here
fetch(localApiURi)
  .then(response => response.json())
  .then(dataJson => {
    const bookInfo = dataJson[0].VehAvailRSCore.VehRentalCore
    const cars = dataJson[0].VehAvailRSCore.VehVendorAvails
    const suppliers = cars.map(car => car.Vendor['@Name'])
    window.localStorage.setItem('scopeSuppliers', JSON.stringify(suppliers))
    renderBookingInfoForm(bookInfo)
    fillSuppilerFilter(suppliers)
    renderListing(cars)
  })
  .catch((err) => { throw new Error(err) })

const renderBookingInfoForm = (bookInfo) => {
  const pickLocationName = bookInfo.PickUpLocation['@Name']
  const dropLocationName = bookInfo.ReturnLocation['@Name']

  // split ISOString by 'T' to get date
  const pickDate = bookInfo['@PickUpDateTime'].split('T')[0]
  const dropDate = bookInfo['@ReturnDateTime'].split('T')[0]

  // use legend to display info
  const fieldset = document.createElement('fieldset')
  const legend = document.createElement('legend')
  legend.innerHTML = 'Booking Information'
  const pickInputTag = document.createElement('input')
  pickInputTag.value = pickLocationName
  const pickLocationLabel = document.createElement('label')
  pickLocationLabel.innerHTML = 'PICK-UP LOCATION: '
  pickLocationLabel.appendChild(pickInputTag)
  const dropInputTag = document.createElement('input')
  dropInputTag.value = dropLocationName
  const dropLocationLabel = document.createElement('label')
  dropLocationLabel.innerHTML = 'DROP-OFF LOCATION: '
  dropLocationLabel.appendChild(dropInputTag)

  // appendChild
  fieldset.appendChild(legend)
  fieldset.appendChild(pickLocationLabel)
  fieldset.appendChild(dropLocationLabel)

  const gridContainer = document.createElement('div')
  gridContainer.className = 'grid-container'
  const pickDateLabel = document.createElement('label')
  pickDateLabel.innerHTML = 'PICK-UP DATE: '
  const pickDateInput = document.createElement('input')
  pickDateInput.value = pickDate
  pickDateLabel.appendChild(pickDateInput)

  const selectedPickTime = document.createElement('select')
  const selectedPickTimeOption = document.createElement('option')
  selectedPickTimeOption.text = bookInfo['@PickUpDateTime'].split('T')[1].replace(':00Z', '')
  selectedPickTime.appendChild(selectedPickTimeOption)

  const dropDateLabel = document.createElement('label')
  dropDateLabel.innerHTML = 'DROP-OFF DATE: '
  const dropDateInput = document.createElement('input')
  dropDateInput.value = dropDate
  dropDateLabel.appendChild(dropDateInput)

  const selectedDropTime = document.createElement('select')
  const selectedDropTimeOption = document.createElement('option')
  selectedDropTimeOption.text = bookInfo['@ReturnDateTime'].split('T')[1].replace(':00Z', '')
  selectedDropTime.appendChild(selectedDropTimeOption)

  // appendChild
  gridContainer.appendChild(pickDateLabel)
  gridContainer.appendChild(selectedPickTime)
  gridContainer.appendChild(document.createElement('br'))
  gridContainer.appendChild(dropDateLabel)
  gridContainer.appendChild(selectedDropTime)
  fieldset.appendChild(gridContainer)

  // append fieldset to search form
  document.getElementById('SearchForm').appendChild(fieldset)
}

const fillSuppilerFilter = (suppliers) => {
  const categorySelect = document.getElementById('categorySelect')
  suppliers.forEach(supplier => {
    const supplierOpt = document.createElement('option')
    supplierOpt.value = supplier
    supplierOpt.innerHTML = supplier
    categorySelect.appendChild(supplierOpt)
  })
}

/**
 * render main listing component
*/
const renderListing = (cars) => {
  const totalCars = getTotal(cars)
  window.localStorage.setItem('scopeCars', JSON.stringify(totalCars))
  // sort by price (low to high) as default
  totalCars.sort((a, b) => parseFloat(a.TotalCharge['@RateTotalAmount']) - parseFloat(b.TotalCharge['@RateTotalAmount']))
  // render single table
  rederSingleView(totalCars)
}

// render single table
const rederSingleView = (totalCars) => {
  const contentContainer = document.getElementById('content-listing')
  removeNode(contentContainer)
  // this modal flag needs to be passed to render view in modal container
  const isModal = false
  totalCars.forEach((singleCar, idx) => {
    // add modal for every single table
    const modalBtn = document.createElement('button')
    modalBtn.id = `showModel${idx}`
    modalBtn.className = `btn${idx} card_btn`
    modalBtn.innerHTML = 'Show Details'

    const tableRightInnerTd2 = document.createElement('td')
    tableRightInnerTd2.appendChild(modalBtn)
    // render single table
    renderSingleTable(singleCar, tableRightInnerTd2, contentContainer, isModal)

    // add modal function and addEventListener
    const showModalBtn = document.getElementById(`showModel${idx}`)
    const close = document.getElementsByClassName('close')[0]
    const cancel = document.getElementById('cancel')
    const modal = document.getElementById('modal')

    showModalBtn.addEventListener('click', () => {
      modal.style.display = 'block'
      // pass current car data to modal
      renderModal(singleCar)
    })
    close.addEventListener('click', () => {
      modal.style.display = 'none'
    })
    cancel.addEventListener('click', () => {
      modal.style.display = 'none'
    })
  })
}

const renderSingleTable = (singleCar, tableRightInnerTd2, mainContainer, isModal) => {
  if (isModal) removeNode(mainContainer)
  const Vehicle = singleCar.Vehicle

  const table = document.createElement('table')
  const tableTr = document.createElement('tr')
  table.appendChild(tableTr)
  const tableLeft = document.createElement('th')
  const tableMid = document.createElement('th')
  const tableRight = document.createElement('th')
  tableTr.appendChild(tableLeft)
  tableTr.appendChild(tableMid)
  tableTr.appendChild(tableRight)
  const carImg = document.createElement('img')
  carImg.src = Vehicle.PictureURL
  tableLeft.appendChild(carImg)

  const tableMidInner = document.createElement('table')
  const tableMidInnerTbody = document.createElement('tbody')
  tableMidInner.appendChild(tableMidInnerTbody)
  tableMid.appendChild(tableMidInner)
  const tableMidInnerTr = document.createElement('tr')
  tableMidInnerTbody.appendChild(tableMidInnerTr)

  // need to deep copy original object instead of shallow copy,
  // so origin object wont be affected if modify items in new copied object
  const deepCopiedVehicle = deepCopy(Vehicle)
  delete deepCopiedVehicle.PictureURL
  delete deepCopiedVehicle.VehMakeModel
  delete deepCopiedVehicle['@CodeContext']
  Object.keys(deepCopiedVehicle).forEach(obj => {
    const txt = document.createElement('p')
    txt.innerHTML = `${obj.replace('@', '').trim()} : ${deepCopiedVehicle[obj]}`
    tableMidInnerTr.appendChild(txt)
  })
  const tableRightInner = document.createElement('table')
  tableRightInner.className = 'tb-right'
  const tableRightInnerTbody = document.createElement('tbody')
  tableRightInner.appendChild(tableRightInnerTbody)
  tableRight.appendChild(tableRightInner)
  const tableRightInnerTr = document.createElement('tr')
  tableRightInnerTbody.appendChild(tableRightInnerTr)

  const tableRightInnerTd = document.createElement('td')
  const tableRightInnerTdSpan = document.createElement('span')
  tableRightInnerTdSpan.innerHTML = `${singleCar.TotalCharge['@EstimatedTotalAmount']} ${singleCar.TotalCharge['@CurrencyCode']}`

  const tableRightInnerTdVendorSpan = document.createElement('span')
  tableRightInnerTdVendorSpan.innerHTML = `Supplier: ${singleCar['@Name']}`

  const tableRightInnerTdStatusSpan = document.createElement('span')
  tableRightInnerTdStatusSpan.innerHTML = `Status: ${singleCar['@Status']}`

  tableRightInnerTd.appendChild(tableRightInnerTdSpan)
  tableRightInnerTd.appendChild(document.createElement('p'))
  tableRightInnerTd.appendChild(tableRightInnerTdVendorSpan)
  tableRightInnerTd.appendChild(document.createElement('p'))
  tableRightInnerTd.appendChild(tableRightInnerTdStatusSpan)
  tableRightInnerTr.appendChild(tableRightInnerTd)
  tableRightInnerTr.appendChild(tableRightInnerTd2)
  mainContainer.appendChild(table)
}

const getTotal = (cars) => {
  const totalAvailableCars = []
  cars.map(car => car.VehAvails.forEach(vehAvail => totalAvailableCars.push(Object.assign(vehAvail, car.Vendor))))
  return totalAvailableCars
}

const renderModal = (currentCar) => {
  // isModal === true if render modal content
  const isModal = true
  // retrieve currentCar
  const tableRightInnerTd2 = document.createElement('td')
  const modalContent = document.getElementById('modal-content')
  renderSingleTable(currentCar, tableRightInnerTd2, modalContent, isModal)
}

// filter function
const filterSelect = document.getElementById('categorySelect')
// add event handler if value changes

filterSelect.addEventListener('change', function () {
  const scopeSupplierFilter = this.value
  window.localStorage.setItem('scopeSupplierFilter', JSON.stringify(scopeSupplierFilter))
  const scopeCars = JSON.parse(window.localStorage.getItem('scopeCars'))
  const scopeSuppliers = JSON.parse(window.localStorage.getItem('scopeSuppliers'))
  if (scopeSuppliers.includes(scopeSupplierFilter)) {
    const filteredCars = scopeCars.filter(car => car['@Name'] === scopeSupplierFilter)
    rederSingleView(filteredCars)
  } else {
    rederSingleView(scopeCars)
  }
})

// sort function
const sortSelect = document.getElementById('select-sort')

// add event handler if value changes
sortSelect.addEventListener('change', function () {
  // this.value;
  const scopeCars = JSON.parse(window.localStorage.getItem('scopeCars'))
  const scopeSupplierFilter = JSON.parse(window.localStorage.getItem('scopeSupplierFilter'))
  if (this.value) {
    const scopeSortQry = this.value
    window.localStorage.setItem('scopeSortQry', JSON.stringify(scopeSortQry))
    let filteredCars
    scopeSortQry !== 'all'
      ? filteredCars = scopeCars.filter(car => car['@Name'].toLowerCase() === scopeSupplierFilter.toLowerCase())
      : filteredCars = scopeCars
    // selectElement('categorySelect', 'Select')
    switch (this.value) {
      case 'pricehl':
        // sort by price (low to high) as default, no need to do deepcopy here
        filteredCars.sort((a, b) => parseFloat(b.TotalCharge['@RateTotalAmount']) - parseFloat(a.TotalCharge['@RateTotalAmount']))
        // render single table
        rederSingleView(filteredCars)
        break
      case 'sizesl':
        filteredCars.sort((a, b) => a.Vehicle['@PassengerQuantity'].localeCompare(b.Vehicle['@PassengerQuantity'], { ignorePunctuation: true }))
        rederSingleView(filteredCars)
        break
      case 'sizels':
        filteredCars.sort((a, b) => b.Vehicle['@PassengerQuantity'].localeCompare(a.Vehicle['@PassengerQuantity'], { ignorePunctuation: true }))
        rederSingleView(filteredCars)
        break
      default:
        filteredCars.sort((a, b) => parseFloat(a.TotalCharge['@RateTotalAmount']) - parseFloat(b.TotalCharge['@RateTotalAmount']))
        // render single table
        rederSingleView(filteredCars)
        break
    }
  }
})
/** helper function
 *  1. check target type
 *  2. deep copy of object or array
 *  3. debounce function to reduce the number of function or api calls
 */

// check target type
const checkedType = (target) => {
  return Object.prototype.toString.call(target).slice(8, -1)
}

// deepCopy object or array
const deepCopy = (target) => {
  let result; const targetType = checkedType(target)
  if (targetType === 'Object') {
    result = {}
  } else if (targetType === 'Array') {
    result = []
  } else {
    return target
  }
  for (const i in target) {
    const value = target[i]
    checkedType(value) === 'Object' || checkedType(value) === 'Array' ? result[i] = deepCopy(value) : result[i] = value
  }
  return result
}

// immediate: true || false, reduce the number of function calls, only call function after user input stops
const debounce = (fn, wait, immediate) => {
  let timeout
  const debounced = () => {
    const context = this
    const args = arguments
    if (timeout) clearTimeout(timeout)
    const callNow = !timeout
    if (immediate) {
      // if excute already, then no need to excute again
      timeout = setTimeout(() => {
        timeout = null
      }, wait)
      if (callNow) fn.apply(context, args)
    } else {
      timeout = setTimeout(() => {
        fn.apply(context, args)
      }, wait)
    }
  }
  debounced.cancel = () => {
    clearTimeout(timeout)
    timeout = null
  }
  return debounced
}

const removeNode = (nodeIdContainer) => {
  while (nodeIdContainer.firstChild) {
    nodeIdContainer.removeChild(nodeIdContainer.firstChild)
  }
}
const search = document.getElementById('search')
const showSearch = document.getElementById('showSearch')
const getSearchInfo = () => {
  const searchPattern = `${search.value}`
  const filteredFuzzySuppliers = []
  const scopeCars = JSON.parse(window.localStorage.getItem('scopeCars'))
  const scopeSuppliers = JSON.parse(window.localStorage.getItem('scopeSuppliers'))

  scopeSuppliers.forEach(supplier => {
    if (supplier.toLowerCase().match(searchPattern.toLowerCase())) filteredFuzzySuppliers.push(supplier)
  })

  if (filteredFuzzySuppliers.length) {
    let finalFiltedCars = []
    filteredFuzzySuppliers.forEach(filteredFuzzySupplier => {
      const filtedcars = scopeCars.filter(car => car['@Name'] === filteredFuzzySupplier)
      finalFiltedCars = [...finalFiltedCars, ...filtedcars]
    })
    rederSingleView(finalFiltedCars)
    showSearch.innerText = `Your search is: [ ${search.value} ], will return ${filteredFuzzySuppliers.toString()}`
  } else {
    const contentContainer = document.getElementById('content-listing')
    removeNode(contentContainer)
    showSearch.innerText = `Your search is: [ ${search.value} ], and your search does not return any results`
  }
}
search.onkeyup = debounce(getSearchInfo, 500)
