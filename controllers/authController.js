const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

exports.signUp = async (req, res, next) => {
  const { password, username } = req.body;
  try {
    const hashPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ username, password: hashPassword });
    req.session.user = user;

    res.status(201).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      status: 'fail',
    });
  }
};

exports.login = async (req, res, next) => {
  const { password, username } = req.body;
  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'user not found',
      });
    }

    const isCorrect = await bcrypt.compare(password, user.password);

    if (isCorrect) {
      req.session.user = user;

      return res.status(200).json({
        status: 'success',
      });
    }

    return res.status(400).json({
      status: 'fail',
      message: 'incorrect username or password',
    });
  } catch (err) {
    console.log({ err });
    res.status(400).json({
      status: 'fail',
    });
  }
};
