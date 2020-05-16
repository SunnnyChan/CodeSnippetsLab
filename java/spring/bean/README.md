# Spring Bean

* 从Spring上下文获取 Bean

```java
@Component("applicationUtils")
public class ApplicationUtils implements ApplicationContextAware {

    @Value("${system.env}")
    private String             env;

    @Value("${project.name}")
    private String appName;

    private ApplicationContext applicationContext;

    /**
     * Gets get env.
     *
     * @return the get env
     */
    public String getEnv() {
        return env;
    }

    /**
     * Sets set env.
     *
     * @param env the env
     */
    public void setEnv(String env) {
        this.env = env;
    }

    /**
     * Gets get app name.
     *
     * @return the get app name
     */
    public String getAppName() {
        return appName;
    }

    /**
     * Sets set app name.
     *
     * @param appName the app name
     */
    public void setAppName(String appName) {
        this.appName = appName;
    }

    /**
     * Gets get application context.
     *
     * @return the get application context
     */
    public ApplicationContext getApplicationContext() {
        return applicationContext;
    }

    /**
     * Sets set application context.
     *
     * @param applicationContext the application context
     * @throws BeansException the beans exception
     */
    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
    }
}
```

* 通过注解获取 bean
```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Inherited
public @interface CardSpi {

    String version();

    /**
     * 业务标识
     */
    String group();
}
```

```java
@Component
public class ServiceFactory {

    private Map<String, QueryService> serviceMap;

    @Autowired
    private ApplicationUtils  applicationUtils;

    @PostConstruct
    public void init() {
        serviceMap = new ConcurrentHashMap<>(16);
        Map<String, QueryService> queryServiceMap = applicationUtils
            .getApplicationContext().getBeansOfType(QueryService.class);
        if (!MapUtils.isEmpty(queryServiceMap)) {
            queryServiceMap.forEach((beanName, queryService) -> {
                CardSpi cardSpi = queryService.getClass()
                    .getAnnotation(CardSpi.class);
                if (cardSpi == null) {
                    return;
                }
                String version = cardSpi.version();
                String group = cardSpi.group();
                serviceMap.put(buildKey(version, group), queryService);
            });
        }
    }

    public QueryService getServices(String version, String group) {
        return serviceMap.get(buildKey(version, group));
    }

    /**
     * key
     * @param version
     * @param group
     * @return
     */
    public String buildKey(String version, String group) {
        return version.concat("-").concat(group);
    }
}
```