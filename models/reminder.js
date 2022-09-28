const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    reminderMessage:{
        type: String,
        required: true
    },
    remindAt:{
        type: Date,
        required: true
    },
    reminded:{
        type: Boolean,
        required: true
    }
});

const reminderModel = mongoose.model('reminder',reminderSchema);

module.exports = reminderModel;