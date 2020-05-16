
# Spring

## [Spring Bean](bean/)  

## Spring Boot

### application.yml  

```yml
server:
  port: 8082
  
spring:
    datasource:
        name: test
        url: jdbc:mysql://127.0.0.1:3306/database
        username: root
        password: ******
        type: com.alibaba.druid.pool.DruidDataSource
        driver-class-name: com.mysql.jdbc.Driver
```  

### application.properties  

```ini
server.port=8081
 
spring.datasource.type=org.apache.tomcat.jdbc.pool.DataSource
spring.datasource.url=jdbc:mysql://aliyuncs.com:3306/database?useUnicode=true&zeroDateTimeBehavior=convertToNull&autoReconnect=true
spring.datasource.username=root
spring.datasource.password=******
spring.datasource.driver-class-name=com.mysql.jdbc.Driver
```

