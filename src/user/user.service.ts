import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';

@Injectable()
export class UserService {
  constructor(@InjectModel(User) private user: typeof User) {}

  /**
   * Поиск пользователя по идентификатору.
   *
   * @async
   * @param {string} id - Идентификатор пользователя
   * @returns {Promise<User | null>}
   */
  async findById(id: string): Promise<User | null> {
    return this.user.findByPk(id);
  }

  /**
   * Поиск пользователя по логину.
   *
   * @async
   * @param {string} login - Логин пользователя
   * @returns {Promise<User | null>}
   */
  async findByLogin(login: string): Promise<User | null> {
    return this.user.findOne({ where: { login } });
  }

  /**
   * Запись refreshTokenHash.
   *
   * @async
   * @param {string} refreshTokenHash - Хэш refresh токена
   * @param {string} userId - Идентификатор пользователя
   * @returns {Promise<void>}
   */
  async setCurrentRefreshToken(
    refreshTokenHash: string,
    userId: string,
  ): Promise<void> {
    await this.user.update({ refreshTokenHash }, { where: { id: userId } });
  }

  /**
   * Удаление refreshTokenHash.
   *
   * @async
   * @param {string} userId - Идентификатор пользователя
   * @returns {Promise<void>}
   */
  async removeRefreshToken(userId: string): Promise<void> {
    await this.user.update(
      { refreshTokenHash: null },
      { where: { id: userId } },
    );
  }
}
