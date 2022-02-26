"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenStream = exports.UploadLink = exports.SharedLink = exports.MachineModel = exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
let machineSchema = new mongoose_1.default.Schema({
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
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    }
});
let userSchema = new mongoose_1.default.Schema({
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
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "SharedLink",
        }],
    uploadLinks: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "UploadLink"
        }],
    streamLinks: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "ScreenStream",
        }]
});
let sharedLink = new mongoose_1.default.Schema({
    mid: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    }
}, {
    timestamps: true,
});
let UploadLinkSchema = new mongoose_1.default.Schema({
    mid: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
        type: mongoose_1.default.Schema.Types.ObjectId,
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
let screenStreamSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
    },
    mid: {
        required: true,
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "MachineModel"
    },
    status: {
        type: Boolean,
        default: true,
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    }
});
exports.User = mongoose_1.default.model('User', userSchema);
exports.MachineModel = mongoose_1.default.model('MachineModel', machineSchema);
exports.SharedLink = mongoose_1.default.model('SharedLink', sharedLink);
exports.UploadLink = mongoose_1.default.model('UploadLink', UploadLinkSchema);
exports.ScreenStream = mongoose_1.default.model('ScreenStream', screenStreamSchema);
//# sourceMappingURL=models.js.map