# Poetica Project

[![Build Status](https://github.com/cdefgah/poetica/workflows/build/badge.svg)](https://github.com/cdefgah/poetica/actions)

#### Актуальная версия [0.94.6 от 19 декабря 2021 года](https://github.com/cdefgah/poetica/releases/tag/v0.94.6).
<hr/>

Проект Poetica призван помочь оператору дежурной команды провести тур чемпионата по [бескрылкам](https://ru.wikipedia.org/wiki/%D0%91%D0%B5%D1%81%D0%BA%D1%80%D1%8B%D0%BB%D0%BA%D0%B0).

Информация о том, как скачать и запустить готовую программу, а также остальная пользовательская документация по проекту находятся по ссылке:  [https://github.com/cdefgah/poetica/wiki](https://github.com/cdefgah/poetica/wiki)

## Сборка проекта

Для самостоятельной сборки проекта из исходных кодов необходимо установить на компьютер следующие инструменты:

* [Java SE (Standard Edition) SDK](http://java.sun.com) версии не ниже 1.8;
* [Node.JS](https://nodejs.org/en/) версия 12.18.4;
* [Angular](https://angular.io/), версия 11.0.5, если будете использовать более новые версии Angular, возможно потребуется мигрировать проект;
* [Apache Maven](https://maven.apache.org/) актуальной версии. Пропишите путь к папке `bin` в Apache Maven в системную переменную окружения `PATH`, чтобы команда `mvn` была доступна из любой папки.

Установка Node.JS и Angular делается следующим образом:

1. Скачиваете и устанавливаете Node.JS
2. Открываете cmd-терминал Windows и даёте команду:

`npm install -g typescript`

Эта команда установит поддержку typescript.

3. Затем в этом-же терминале даёте команду:

`npm install -g @angular/cli@11.0.5`

После этого даёте команду в терминале:

`ng --version`

Должна отобразиться информация об установленном Angular и его компонентах.

Если это первая сборка проекта, то перейдите в папку `src/main/frontend`, откройте терминал в этой папке и дайте команду:

`npm install`

Это установит все необходимые зависимости для сборки части проекта, построенной на Angular.

Затем, в корневой папке проекта (там, где находится файл `pom.xml`), в терминале дайте команду:

`mvn clean package`

После выполнения сборки, из папки `target` забирайте файл `poetica-x.xx.x-distrib.zip`, где `x.xx.x` - номер версии, например: `poetica-0.94.6-distrib.zip`.

Внутри этого zip-архива находится папка со всеми файлами приложения. Просто распакуйте этот архив и следуйте [инструкциям пользовательской документации по запуску приложения](https://github.com/cdefgah/poetica/wiki/%D0%9E-%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D0%B5).

В текущем архиве дистрибутива файл приложения имеет расширение `.dat` вместо `.jar`, это сделано специально, чтобы Windows-пользователи не запустили программу, случайно кликнув по файлу мышкой.
Ибо в таком случае jar-файл будет запущен без открытия окна приложения и пользователь не будет видеть, запущено у него приложение или нет.

В текущей версии, часть проекта на Angular собирается вместе с отладочной информацией, чтобы облегчить выявление причин сбоев во время работы программы. За это отвечает вот этот участок `pom.xml`

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
