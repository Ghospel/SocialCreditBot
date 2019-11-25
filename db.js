require('dotenv').config();
import User from './user';

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
let db;
let collection;

 MongoClient.connect(process.env.DB_HOST, function(err, client){
    assert.equal(null, err);
    console.log("Connected.")
    db = client.db(process.env.DB_NAME);
    collection = db.collection('users');
})

export const saveUser = async (user) => {
    if(user._id == null || user._id == undefined){
        await collection.insertOne(user);
    } else {
        await collection.updateOne({"_id": user._id}, {$set:
            {
             firstName: user.firstName,
             userId: user.userId,
             socialCreditScore: user.socialCreditScore}}, 
            {upsert: true}
            )
    }
}

export const getUsers = async () => {
    let res = await collection.find({}).sort({socialCreditScore: -1});
    return res;
}

export const getUserById = async (user_id) => {
    let test = await collection.findOne({userId: user_id});
    if(test != undefined){
        let u = new User(test.userId, test.firstName, test.socialCreditScore);
        u._id = test._id;
        return u;
    } else {
        return undefined
    }
}