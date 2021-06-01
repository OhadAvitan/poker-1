const dbService = require('../../services/db.service')
const tableService = require('../table/table.service')
// const logger = require('../../services/logger.service')
const reviewService = require('../review/review.service')
const ObjectId = require('mongodb').ObjectId

module.exports = {
    insert,
    isUserExist,
    query,
    getById,
    add,
    addUserToTable,
    update,
    getByUsername,
    remove
}

async function insert(user, isOwner = false) {
    try {
        console.log('HIIIIIIIIIIIIIII');
        const collection = await dbService.getCollection('users')
        console.log('HIIIIIIIIIIIIIII2222222');
        // if (isUserExist(user)) { return false }
        // if (isExsit) return alert('User already Exist..heading to login page')
        //Insert if not exist
        // user.hand = []
        user.isOwner = isOwner
        await collection.insertOne(user)
        console.log('USER INSERTED');
        return user
    } catch (err) {
        logger.error(`while inserting user ${username}`, err)
        throw err
    }
}

async function isUserExist(user) {
    const collection = await dbService.getCollection('users')

    //Checks if exist .. not exist return false (cetch err )
    const isExsit = await collection.find({ 'phoneNumber': user.phoneNumber }).count() === 1 ? true : false
    return isExsit
}

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection('users')
        var users = await collection.find(criteria).toArray()
        users = users.map(user => {
            delete user.password
            user.isHappy = true
            user.createdAt = ObjectId(user._id).getTimestamp()
            // Returning fake fresh data
            // user.createdAt = Date.now() - (1000 * 60 * 60 * 24 * 3) // 3 days ago
            return user
        })
        return users
    } catch (err) {
        logger.error('cannot find users', err)
        throw err
    }
}

async function getById(userId) {
    try {
        const collection = await dbService.getCollection('users')
        const user = await collection.findOne({ '_id': ObjectId(userId) })
        // delete user.password

        // user.givenReviews = await reviewService.query({ byUserId: ObjectId(user._id) })
        // user.givenReviews = user.givenReviews.map(review => {
        //     delete review.byUser
        //     return review
        // })
        console.log('user GET BY ID:', user);
        return user
    } catch (err) {
        logger.error(`while finding user ${userId}`, err)
        throw err
    }
}

async function addUserToTable(userId, tableId) {
    try {
        // console.log('UserToTable (table.service):');
        // console.log('----------------------------');
        const user = await getById(userId)
        const table = await tableService.getById(tableId)
        table.players.push(user)
        //now I need to update the table in the DB
        tableService.update(table)
        return true
    } catch (err) {
        logger.error(`while finding table ${tableId}`, err)
        throw err
    }
}

async function getByUsername(username) {
    try {
        const collection = await dbService.getCollection('users')
        const user = await collection.findOne({ username })
        return user
    } catch (err) {
        logger.error(`while finding user ${username}`, err)
        throw err
    }
}

async function remove(userId) {
    try {
        const collection = await dbService.getCollection('users')
        await collection.deleteOne({ '_id': ObjectId(userId) })
    } catch (err) {
        logger.error(`cannot remove user ${userId}`, err)
        throw err
    }
}

async function update(user) {
    try {
        // peek only updatable fields!
        const userToSave = {
            _id: ObjectId(user._id),
            username: user.username,
            fullname: user.fullname,
            score: user.score
        }
        const collection = await dbService.getCollection('users')
        await collection.updateOne({ '_id': userToSave._id }, { $set: userToSave })
        return userToSave;
    } catch (err) {
        logger.error(`cannot update user ${user._id}`, err)
        throw err
    }
}

async function add(user) {
    try {
        // peek only updatable fields!
        const userToAdd = {
            username: user.username,
            password: user.password,
            fullname: user.fullname,
            score: user.score || 0
        }
        const collection = await dbService.getCollection('users')
        await collection.insertOne(userToAdd)
        return userToAdd
    } catch (err) {
        logger.error('cannot insert user', err)
        throw err
    }
}






function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.txt) {
        const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
        criteria.$or = [
            {
                username: txtCriteria
            },
            {
                fullname: txtCriteria
            }
        ]
    }
    if (filterBy.minBalance) {
        criteria.balance = { $gte: filterBy.minBalance }
    }
    return criteria
}


