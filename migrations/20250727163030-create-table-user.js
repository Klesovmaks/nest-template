'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.createTable(
        'User',
        {
          id: {
            type: Sequelize.UUID,
            allowNull: false,
            primaryKey: true,
          },
          login: {
            type: Sequelize.STRING,
          },
          passwordHash: {
            type: Sequelize.STRING,
          },
          refreshTokenHash: {
            type: Sequelize.STRING,
            allowNull: true,
          },
          role: {
            type: Sequelize.STRING,
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
        },
        { transaction },
      );

      await queryInterface.addIndex('User', ['login'], {
        unique: true,
        name: 'user_login_unique_index',
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.dropTable('User', { transaction });

      await queryInterface.removeIndex('User', 'user_login_unique_index', {
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      transaction.rollback();
      throw error;
    }
  },
};
