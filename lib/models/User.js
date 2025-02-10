import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  isGuest: {
    type: Boolean,
    default: false,
  },
  createdEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  }],
  attendingEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  }],
}, {
  timestamps: true,
});

// Prevent password from being sent to the client
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User; 