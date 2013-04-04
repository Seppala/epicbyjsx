// Filling Mongodb with Oleg as an upfo true test user
// Note this also resets the database!
// Run it through "mongo mongo_fill.js"
conn = new Mongo();
db = conn.getDB("test")
db.users.drop();
db.users.insert({"name":"Oleg Podsechin","fbId":"36903358","upfo": true,"message":"Javascript session?"});
db.users.insert({"name":"Pia Henrietta Kekäläinen","fbId":"100001140546837","upfo":false,"message":"We're at railsgirls!"});