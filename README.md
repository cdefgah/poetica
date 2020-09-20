# Poetica Project

Проект Poetica призван помочь оператору дежурной команды провести тур чемпионата по [бескрылкам](https://ru.wikipedia.org/wiki/%D0%91%D0%B5%D1%81%D0%BA%D1%80%D1%8B%D0%BB%D0%BA%D0%B0).

Пользовательская документация по проекту:  [https://github.com/cdefgah/poetica/wiki](https://github.com/cdefgah/poetica/wiki)

## Сборка проекта

Для сборки проекта необходимо установить на компьютер следующие инструменты:

* [Java SE (Standard Edition) SDK](http://java.sun.com) версии не ниже 1.8;
* [Node.JS](https://nodejs.org/en/) актуальной версии, либо LTS (Long Term Support);
* [Angular](https://angular.io/), с версией не ниже 10.0;
* [Apache Maven](https://maven.apache.org/) актуальной версии. Пропишите путь к папке `bin` в Apache Maven в системную переменную окружения `PATH`, чтобы команда `mvn` была доступна из любой папки.

Если это первая сборка проекта, то перейдите в папку `src/main/frontend`, откройте терминал в этой папке и дайте команду:

`npm install`

Это установит все необходимые зависимости для сборки части проекта, построенной на Angular.

Затем, в корневой папке проекта (там, где находится файл `pom.xml`), в терминале дайте команду:

`mvn clean package`

После выполнения сборки, из папки `target` забирайте следующие файлы и папки:

* файл `poetica-x.xx.jar` - где `x.xx` - номер версии, например `poetica-0.92.jar`
* папку `config` со всем содержимым

В текущем архиве дистрибутива приложения файл poetica-x.xx имеет расширение `.dat` вместо `.jar`, это сделано специально, чтобы Windows-пользователи не запустили программу, случайно кликнув по файлу мышкой.
Ибо в таком случае jar-файл будет запущен без открытия окна приложения и пользователь не будет видеть, запущено у него приложение или нет.

В текущей версии, часть проекта на Angular собирается вместе с отладочной информацией, чтобы облегчить выявление проблем при сбоях. За это отвечает вот этот участок `pom.xml`

```xml
    <configuration>
        <executable>ng</executable>
        <workingDirectory>src/main/frontend</workingDirectory>
        <arguments>
            <argument>build</argument>
        </arguments>
    </configuration>
```

Для того, чтобы исключить отладочную информацию из Angular-сборки, измените вышеописанный блок кода на такой:

```xml
    <configuration>
        <executable>ng</executable>
        <workingDirectory>src/main/frontend</workingDirectory>
        <arguments>
            <argument>build</argument>
            <argument>--prod</argument>
        </arguments>
    </configuration>
```
