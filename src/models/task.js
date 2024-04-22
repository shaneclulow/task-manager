const mongoose = require('mongoose')
const sanitizeHtml = require('sanitize-html')

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
});

taskSchema.pre('save', function (next) {
    if (this.description) {
        this.description = sanitizeHtml(this.description, {
            allowedTags: [],  
            allowedAttributes: {}  
        });
    }
    next();
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;