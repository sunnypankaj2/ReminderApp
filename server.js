const express = require('express');
const mongoose = require('mongoose');

const Reminder = require('./models/reminder');

if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const DATABASE_URL = process.env.DATABASE_URL,dburl='mongodb://localhost/reminder_database';
const PORT = process.env.PORT;

mongoose.connect(DATABASE_URL||dburl, { useNewUrlParser: true, useUnifiedTopology: true}, err=>{
    console.log("connecting to database....");
    if(err){
        console.error(err);
        console.log("could not connect to database");
    }else{
        console.log("connected to database");
    }
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.listen(PORT|3000, err=>{
    if(err){
        console.error(err);
    }else{
        console.log("listening at port",PORT);
    }
});


app.get('/getAllReminders', async (req,res)=>{
    try{    
        const allReminders = await Reminder.find();    
        if(allReminders.length !==0 ){  
            res.status(201).send(allReminders);    
        }else{   
            res.status(201).send({message: "No Reminders"});
        }
    }
    catch(err){
        console.error(err);
        res.status(500).send();
    }
});

app.get('/getAllReminded', async (req,res)=>{
    try{    
        const allReminders = await Reminder.find({reminded:{$ne:false}});    
        if(allReminders.length !==0 ){  
            res.status(201).send(allReminders);    
        }else{   
            res.status(201).send({message: "No Reminders"});
        }
    }
    catch(err){
        console.error(err);
        res.status(500).send();
    }
});


app.get('/getReminderByName', async(req,res)=>{
    try{   
        const reminder = await Reminder.find({reminderMessage: req.body.reminder});
        if(reminder.length===0){            
            res.status(201).json(reminder);       
        }else{            
            res.status(400).send("could not find such reminder");
        }
    }catch(err){  
        console.log(err);
        res.status(500).send();
    }
});

app.post('/addReminder', async(req,res)=>{
    try{
        const body = req.body;
        const reminder = new Reminder({
            reminderMessage: body.reminder,
            remindAt: new Date(body.remindAt),
            reminded:false
        })
        const newReminder = await reminder.save();
        res.status(201).json(newReminder);       
    }
    catch(err){
        console.error(err);
        res.status(500).send();
    }
});

app.delete('/deleteById/:id', async(req,res)=>{
   try{    
        const reminder = await Reminder.findById(req.params.id);
        if(reminder){
            reminder.remove();
            res.status(201).json({message: "Deleted"});
        }else{
            res.status(400).send({message: "Could not find any such reminder "});
        }
    }catch(err){
        console.log(err);
        res.status(500).send();
    } 
});

setInterval( async() => {
    try{
        const allReminders = await Reminder.find({reminded: {$ne: true}, remindAt: {$lte: new Date()}});
        if(allReminders.length!==0){
            allReminders.forEach(async (reminder) => {
                try{
                    const Now = new Date();

                    // code for sending the reminder

                    console.log("reminded "+reminder.reminderMessage+" at "+Now);
                    reminder.reminded = true;
                    await reminder.save();
                }catch(err){
                    console.error(err);
                }         
            });
        }
        console.log("server listening .... ");
    }catch(err){
        console.error(err);
    }
},1000);