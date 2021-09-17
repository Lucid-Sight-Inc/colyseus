import Redis from 'ioredis';
import { promisify } from 'util';

import { Presence } from '@colyseus/core';

type Callback = (...args: any[]) => void;

export class RedisPresence implements Presence {
    public sub: Redis;
    public pub: Redis;

    protected subscriptions: { [channel: string]: Callback[] } = {};

    protected subscribeAsync: any;
    protected unsubscribeAsync: any;
    protected publishAsync: any;

    protected smembersAsync: any;
    protected sismemberAsync: any;
    protected hgetAsync: any;
    protected hlenAsync: any;
    protected pubsubAsync: any;
    protected incrAsync: any;
    protected decrAsync: any;
    
    private prefix: string;

    constructor(opts?, prefix?: string) {
        this.sub = new Redis(opts);
        this.pub = new Redis(opts);
        this.prefix = (prefix !== undefined) ? prefix : "";

        // no listener limit
        this.sub.setMaxListeners(0);

        // create promisified pub/sub methods.
        this.subscribeAsync = promisify(this.sub.subscribe).bind(this.sub);
        this.unsubscribeAsync = promisify(this.sub.unsubscribe).bind(this.sub);

        this.publishAsync = promisify(this.pub.publish).bind(this.pub);

        // create promisified redis methods.
        this.smembersAsync = promisify(this.pub.smembers).bind(this.pub);
        this.sismemberAsync = promisify(this.pub.sismember).bind(this.pub);
        this.hgetAsync = promisify(this.pub.hget).bind(this.pub);
        this.hlenAsync = promisify(this.pub.hlen).bind(this.pub);
        this.pubsubAsync = promisify(this.pub.pubsub).bind(this.pub);
        this.incrAsync = promisify(this.pub.incr).bind(this.pub);
        this.decrAsync = promisify(this.pub.decr).bind(this.pub);
    }

    public async subscribe(topic: string, callback: Callback) {
        topic = this.prefix+topic;
        if (!this.subscriptions[topic]) {
          this.subscriptions[topic] = [];
        }

        this.subscriptions[topic].push(callback);

        if (this.sub.listeners('message').length === 0) {
          this.sub.addListener('message', this.handleSubscription);
        }

        await this.subscribeAsync(topic);

        return this;
    }

    public async unsubscribe(topic: string, callback?: Callback) {
        topic = this.prefix+topic;
        const topicCallbacks = this.subscriptions[topic];
        if (!topicCallbacks) { return; }

        if (callback) {
          const index = topicCallbacks.indexOf(callback);
          topicCallbacks.splice(index, 1);

        } else {
          this.subscriptions[topic] = [];
        }

        if (this.subscriptions[topic].length === 0) {
          delete this.subscriptions[topic];
          await this.unsubscribeAsync(topic);
        }

        return this;
    }

    public async publish(topic: string, data: any) {
        topic = this.prefix+topic;
        if (data === undefined) {
            data = false;
        }

        await this.publishAsync(topic, JSON.stringify(data));
    }

    public async exists(roomId: string): Promise<boolean> {
        roomId = this.prefix+roomId;
        return (await this.pubsubAsync('channels', roomId)).length > 0;
    }

    public async setex(key: string, value: string, seconds: number) {
        key = this.prefix+key;
      return new Promise((resolve) =>
        this.pub.setex(key, seconds, value, resolve));
    }

    public async get(key: string) {
        key = this.prefix+key;
        return new Promise((resolve, reject) => {
            this.pub.get(key, (err, data) => {
                if (err) { return reject(err); }
                resolve(data);
            });
        });
    }

    public async del(roomId: string) {
        roomId = this.prefix+roomId;
        return new Promise((resolve) => {
            this.pub.del(roomId, resolve);
        });
    }

    public async sadd(key: string, value: any) {
        key = this.prefix+key;
        return new Promise((resolve) => {
            this.pub.sadd(key, value, resolve);
        });
    }

    public async smembers(key: string): Promise<string[]> {
        key = this.prefix+key;
        return await this.smembersAsync(key);
    }

    public async sismember(key: string, field: string): Promise<number> {
        key = this.prefix+key;
        return await this.sismemberAsync(key, field);
    }

    public async srem(key: string, value: any) {
        key = this.prefix+key;
        return new Promise((resolve) => {
            this.pub.srem(key, value, resolve);
        });
    }

    public async scard(key: string) {
        key = this.prefix+key;
        return new Promise((resolve, reject) => {
            this.pub.scard(key, (err, data) => {
                if (err) { return reject(err); }
                resolve(data);
            });
        });
    }

    public async sinter(...keys: string[]) {
        for (let index = 0; index < keys.length; index++) {
            const tkey = keys[index];
            keys[index] = this.prefix+tkey;
        }
        return new Promise<string[]>((resolve, reject) => {
            this.pub.sinter(...keys, (err, data) => {
                if (err) { return reject(err); }
                resolve(data);
            });
        });
    }

    public async hset(key: string, field: string, value: string) {
        key = this.prefix+key;
        return new Promise((resolve) => {
            this.pub.hset(key, field, value, resolve);
        });
    }

    public async hincrby(key: string, field: string, value: number) {
        key = this.prefix+key;
        return new Promise((resolve) => {
            this.pub.hincrby(key, field, value, resolve);
        });
    }

    public async hget(key: string, field: string) {
        key = this.prefix+key;
        return await this.hgetAsync(key, field);
    }

    public async hgetall(key: string) {
        key = this.prefix+key;
        return new Promise<{ [key: string]: string }>((resolve, reject) => {
            this.pub.hgetall(key, (err, values) => {
              if (err) { return reject(err); }
              resolve(values);
            });
        });
    }

    public async hdel(key: string, field: string) {
        key = this.prefix+key;
        return new Promise((resolve, reject) => {
            this.pub.hdel(key, field, (err, ok) => {
              if (err) { return reject(err); }
              resolve(ok);
            });
        });
    }

    public async hlen(key: string): Promise<number> {
        key = this.prefix+key;
        return await this.hlenAsync(key);
    }

    public async incr(key: string): Promise<number> {
        key = this.prefix+key;
        return await this.incrAsync(key);
    }

    public async decr(key: string): Promise<number> {
        key = this.prefix+key;
        return await this.decrAsync(key);
    }

    public shutdown() {
        this.sub.quit();
        this.pub.quit();
    }

    protected handleSubscription = (channel, message) => {
        if (this.subscriptions[channel]) {
          for (let i = 0, l = this.subscriptions[channel].length; i < l; i++) {
            this.subscriptions[channel][i](JSON.parse(message));
          }
        }
    }

}
