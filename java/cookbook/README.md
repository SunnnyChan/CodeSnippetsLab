# Cookbook

## 打印异常日志  

```java
Log.error("exception type : " + ex.getClass() + ", error message : " + ex.getMessage(), ex);
Arrays.stream(ex.getStackTrace()).forEach(r -> Log.warn(r.toString()));
```
