const express = require('express');
const mongoose = require('mongoose');

const Reminder = require('./models/reminder');

if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const DATABASE_URL = process.env.DATABASE_URL,dburl='mongodb://localhost/reminder_database';
const port = process.env.PORT;

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

app.listen(port|3000, err=>{
    if(err){
        console.error(err);
    }else{
        console.log("listening at port",port);
    }
});


app.get('/getAllReminders', async (req,res)=>{
    try{    
        const allReminders = await Reminder.find({});    
        if(allReminders.length !==0 ){  
            res.status(200).send(allReminders);    
        }else{   
            res.send({message: "No Reminders"});
        }
    }
    catch(err){
        console.error(err);
        res.status(500).send();
    }
});

app.get('/getReminder', async(req,res)=>{
    try{   
        const reminder = await Reminder.findOne({reminderMessage: req.body.reminder});
        if(reminder){            
            res.status(200).json(reminder);       
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
        const exist = await Reminder.findOne({reminderMessage: req.body.reminder});
        if(exist){   
            res.status(400).send({message: "Already exists "});
        }else{
            const reminder = new Reminder({
                reminderMessage: body.reminder,
                remindAt: new Date(body.remindAt),
                reminded:false
            })
            const newReminder = await reminder.save();
            res.status(201).json(newReminder);
        }       
    }
    catch(err){
        console.error(err);
        res.status(500).send();
    }
});

app.delete('/:id', async(req,res)=>{
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
        const allReminders = await Reminder.find({});
        if(allReminders.length!==0){
            allReminders.forEach(async (reminder) => {
                try{
                    if(!reminder.reminded){
                        const now = new Date();
                        if(reminder.remindAt-now < 0){
                            // code for sending the reminder
                            console.log("reminded "+reminder.reminderMessage+" at "+now);
                            await Reminder.findByIdAndDelete(reminder._id);
                        }
                    }
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