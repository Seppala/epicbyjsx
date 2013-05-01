
//module.exports = function() {

// Sorting from http://stackoverflow.com/questions/979256/sorting-an-array-of-javascript-objects

exports.sort_by = function(field, reverse, primer){

   var key = function (x) {return primer ? primer(x[field]) : x[field]};

   return function (a,b) {
       var A = key(a), B = key(b);
       return ((A < B) ? -1 : (A > B) ? +1 : 0) * [-1,1][+!!reverse];                  
   }
};

//};

/* EXAMPLE

// Now you can sort by any field at will...

var homes = [{
   "h_id": "3",
   "city": "Dallas",
   "state": "TX",
   "zip": "75201",
   "price": "162500"
}, {
   "h_id": "4",
   "city": "Bevery Hills",
   "state": "CA",
   "zip": "90210",
   "price": "319250"
}, {
   "h_id": "5",
   "city": "New York",
   "state": "NY",
   "zip": "00010",
   "price": "962500"
}];

// Sort by price high to low
homes.sort(sort_by('price', true, parseInt));

// Sort by city, case-insensitive, A-Z
homes.sort(sort_by('city', false, function(a){return a.toUpperCase()}));

*/