# 类型转换

## String
```java
// **  String to long **
long l = Long.parseLong(String s, int radix) 
// s 这是一个包含long表示要解析的字符串
// n 是进制数，它是将第一个参数用第二个参数进制来表示，默认是十进制
long l = Long.parseLong("0", 10); //returns 0L
long l = Long.parseLong("-BB", 16);  //returns -187L

long l = Long.valueOf("123").longValue();

// **  String to Long **
Long l = Long.valueOf("123");


// **  String to Boolean **
String str = "true";
Boolean.getBoolean(str);


```

## Long
```java
// **  Long to  String **
String str = Long.toString(100L);
String str = String.valueOf(100L);
```

## Boolean
```java
// **  Boolean  to String **

```

## boolean
```java
// **  boolean  to String **
boolean b = true;
String str = String.valueOf(b);


```
