'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Weabot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Weabot.init({
    groupID: DataTypes.STRING,
    groupInfo: DataTypes.JSONB
  }, {
    sequelize,
    modelName: 'Weabot',
  });
  return Weabot;
};