import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

interface SignUpParam {
  username: string;
  password: string;
  name: string;
  age: number;
  phone_number: string;
  email: string;
}

interface Auth {
  uid: string;
  auth_code: string;
}

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  /*
   *SignUp allows the unique username to be created
   */
  async signUp(param: SignUpParam): Promise<Auth> {
    const uid = uuidv4();
    const authCode = uuidv4();

    const username = param.username;
    const checkValidUsername = this.prisma.user.findFirst({
      where: { username },
    });
    if (checkValidUsername === null) {
      throw new Error('Username already exists');
    }

    await this.prisma.user.create({
      data: {
        uid,
        username: username,
        password: param.password, // Note: Hash the password in production
        name: param.name,
        age: param.age,
        phone: param.phone_number,
        email: param.email,
        create_time: new Date(),
      },
    });

    return { uid, auth_code: authCode };
  }

  async sendVerificationCode(auth: Auth, houseId: string): Promise<void> {
    if (!houseId) {
      throw new Error('House ID is required');
    }
    const house = await this.prisma.house.findFirst({
      where: { house_id: houseId },
      include: { user: true },
    });

    if (!house) {
      throw new Error('House not found');
    }

    const rootOwner = house.user.find((user) => user.root_owner);

    if (!rootOwner) {
      throw new Error('Root owner not found for the house');
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit code

    await this.prisma.house.update({
      where: { house_id: houseId },
      data: {
        verify_code: verificationCode,
        verify_time: new Date(),
      },
    });

    // Simulate sending email (replace with actual email service)
    // console.log(`Verification code sent to ${rootOwner.email}: ${verificationCode}`);
    const mailerSend = new MailerSend({
      apiKey: process.env.API_KEY,
    });

    const sentFrom = new Sender(
      'Admin@trial-86org8e2nz0gew13.mlsender.net',
      'Admin Home',
    );

    const recipients = [new Recipient(`${rootOwner.email}`, '')];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject('Your OTP').setHtml(`<h3>Your OTP is ${verificationCode}</h3>
                        <br>
                        <h3>Don't reply this email !</h3>`);

    await mailerSend.email.send(emailParams);
  }

  async verifyHouse(auth: Auth, houseId: string, code: string): Promise<void> {
    const house = await this.prisma.house.findUnique({
      where: { house_id: houseId },
    });

    if (!house) {
      throw new Error('House not found');
    }

    if (house.verify_code !== parseInt(code, 10)) {
      throw new Error('Invalid verification code');
    }

    const currentTime = new Date();
    const verifyTime = house.verify_time;

    if (
      !verifyTime ||
      currentTime.getTime() - verifyTime.getTime() > 10 * 60 * 1000
    ) {
      throw new Error('Verification code expired');
    }

    await this.prisma.user.update({
      where: { uid: auth.uid },
      data: { house_id: houseId },
    });

    // Clear the verification code after successful verification
    await this.prisma.house.update({
      where: { house_id: houseId },
      data: { verify_code: null, verify_time: null },
    });
  }

  async login(
    username: string,
    password: string,
  ): Promise<{ auth: Auth; own_house: boolean; root_owner: boolean }> {
    const user = await this.prisma.user.findFirst({
      where: { username },
    });

    if (!user || user.password !== password) {
      throw new Error('Invalid username or password');
    }

    const auth: Auth = {
      uid: user.uid,
      auth_code: uuidv4(),
    };

    return {
      auth,
      own_house: !!user.house_id,
      root_owner: !!user.root_owner,
    };
  }

  async logout(auth: Auth): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { uid: auth.uid },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Invalidate the auth_code (this can be done by removing it or updating it in the database)
    // For simplicity, we are not persisting auth_code in the database in this example.
    console.log(`User ${auth.uid} logged out successfully.`);
  }

  async getUserInfo(auth: Auth): Promise<{
    uid: string;
    house_id: string | null;
    root_owner: boolean;
    name: string;
    age: number | null;
    phone_number: string | null;
    email: string;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { uid: auth.uid },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      uid: user.uid,
      house_id: user.house_id,
      root_owner: !!user.root_owner,
      name: user.name || '',
      age: user.age || null,
      phone_number: user.phone || null,
      email: user.email,
    };
  }

  async getNotifications(auth: Auth): Promise<{
    total: number;
    unread: number;
    notices: Array<{
      id: string;
      time: string;
      content: string;
      read: boolean;
    }>;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { uid: auth.uid },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const notifications = await this.prisma.noti.findMany({
      where: { uid: auth.uid },
      orderBy: { time: 'desc' },
    });

    const total = notifications.length;
    const unread = notifications.filter((noti) => !noti.read).length;

    const notices = notifications.map((noti) => ({
      id: noti.noti_id,
      time: noti.time.toISOString(),
      content: noti.content,
      read: noti.read,
    }));

    return { total, unread, notices };
  }

  async updateUserInfo(
    auth: Auth,
    data: {
      name: string;
      age: number;
      phone_number: string;
      email: string;
    },
  ): Promise<{
    uid: string;
    house_id: string | null;
    root_owner: boolean;
    name: string;
    age: number | null;
    phone_number: string | null;
    email: string;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { uid: auth.uid },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const updatedData = {};
    if (data.name) updatedData['name'] = data.name;
    if (data.age) updatedData['age'] = data.age;
    if (data.phone_number) updatedData['phone'] = data.phone_number;
    if (data.email) updatedData['email'] = data.email;

    const updatedUser = await this.prisma.user.update({
      where: { uid: auth.uid },
      data: updatedData,
    });

    return {
      uid: updatedUser.uid,
      house_id: updatedUser.house_id,
      root_owner: !!updatedUser.root_owner,
      name: updatedUser.name || '',
      age: updatedUser.age || null,
      phone_number: updatedUser.phone || null,
      email: updatedUser.email,
    };
  }
}
