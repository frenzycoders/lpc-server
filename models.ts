import mongoose from 'mongoose';

let machineSchema = new mongoose.Schema({
    socketId: {
        type: String,
        default: '',
    },
    name: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        required: true,
        default: false,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
});

let userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    username: {
        type: String,
        unique: true,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    token: [{ type: String }],
    publicLinks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "SharedLink",
    }],
    uploadLinks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "UploadLink"
    }],
    streamLinks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "ScreenStream",
    }]
})

let sharedLink = new mongoose.Schema({
    mid: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "MachineModel"
    },
    contentPath: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        default: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    }
}, {
    timestamps: true,
})

let UploadLinkSchema = new mongoose.Schema({
    mid: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "MachineModel"
    },
    title: {
        type: String,
        required: true,
    },
    contentPath: {
        type: String,
        required: true,
    },
    oneUse: {
        type: Boolean,
        default: true,
    },
    status: {
        type: Boolean,
        default: true,
    },
    uploadedFileName: {
        type: String,
        default: '',
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    fileSize: {
        type: String,
        default: "50 MB",
    }
}, {
    timestamps: true,
});

let screenStreamSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    mid: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: "MachineModel"
    },
    status: {
        type: Boolean,
        default: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    }
});

export const User = mongoose.model('User', userSchema);
export const MachineModel = mongoose.model('MachineModel', machineSchema);
export const SharedLink = mongoose.model('SharedLink', sharedLink);
export const UploadLink = mongoose.model('UploadLink', UploadLinkSchema);
export const ScreenStream = mongoose.model('ScreenStream', screenStreamSchema);