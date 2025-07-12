const userSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    mobileNo: { type: String, required: true },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
});