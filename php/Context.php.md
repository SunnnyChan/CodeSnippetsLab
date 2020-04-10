```php
<?php

class Pay_Rpc_Async_Context{
    //�������ݴ���ʱ��KEY
    const CACHE_DATA = 'CACHEDATA';
    /**
     * ��ǰ���û�ģ��
     * 
     * @var Pay_Rpc_Async_Context
     */
    private static $instance;
    
    /**
     * ���ص�ǰ�첽�Ự
     * 
     * @return Pay_Rpc_Async_Context
     */
    public static function getInstance(){
        if(!isset(self::$instance)){
            self::$instance = new Pay_Rpc_Async_Context();
        }
        return self::$instance;
    }
    
    private static $support;
    
    /**
     * �Ƿ�֧��RAL�첽
     * 
     * @return boolean
     */
    public static function supportRalAsync(){
        if(!isset(self::$support)){
            self::$support = function_exists('ral_event_add');
        }
        return self::$support;
    }
    
    /**
     * Ral�첽���
     * 
     * @var array
     */
    protected $asyncResult;
    
    /**
     * �첽����ͳ��
     * 
     * @var array
     */
    protected $asyncStatData;
    
    /**
     * �Ƿ��ռ��첽ͳ������
     * 
     * @var boolean
     */
    protected $asyncStatConfig;
    
    /**
     * ��ʼ��
     * 
     * @throws Exception
     */
    private function __construct(){
        if(!self::supportRalAsync()){
            Bd_Log::fatal('ral version is too old, can not supprot ral async');
            throw new Exception('ral not support async', Pay_Def_ErrorCode::PAY_WEB_INTERNAL);
        }
        $this->asyncResult = array();
        $this->asyncStatConfig = true;
    }
    
    /**
     * �첽ʱ�����
     * 
     * @param string $asyncName
     * @param string $statKey
     * @param string $currTime ��ǰʱ�䣬��ѡ
     */
    private function _addAsyncStatData($asyncName, $statKey, $currTime = null){
        if($this->asyncStatConfig){
            $this->asyncStatData[$asyncName][$statKey] = ($currTime === null) ? intval(microtime(true) * 1000) : $currTime;
        }
    }
    
    /**
     * �����첽����
     * 
     * @param string $asyncName
     * @param string $service
     * @param string $path
     * @param array $data
     * @param array $headers
     * @throws Exception    ����RAL�첽�¼��쳣ʱ���쳣
     */
    public function addHttpAsyncRpc($asyncName, $service, $path, array $data, array $headers){
        Bd_Log::trace("add async[$asyncName], param:" . print_r($data, true));
        $extra = array(
            'interface' => 'async_' . $asyncName,
        );
        $headers['pathinfo'] = $path;
        $ret = ral_event_add($asyncName, $service, 'post', $data, $extra, $headers);
        $this->_addAsyncStatData($asyncName, 'add_time');
        if(false === $ret){
            Bd_Log::fatal('ral_event_add failed: ' . $asyncName . ', errno: ' . ral_get_errno());
            throw new Exception('ral_event_add failed: ' . $asyncName, Pay_Def_ErrorCode::PAY_WEB_INTERNAL);
        }
        else{
            Bd_Log::trace('ral_event_add success: ' . $asyncName);
        }
    }
    
    /**
     * �����첽����
     * ע��trigger��һ���ɹ�
     * 
     * @param string $asyncName
     * @param int $waitTime Ĭ�ϵȴ�ʱ�䣬ral_loop�Ǵ���д������
     * @throws Exception    ����RAL�첽�¼��쳣ʱ���쳣
     */
    public function triggerAsyncRpc($asyncName, $waitTime = 3){
        ral_set_logid(Pay_Base_Request::addLogidr());
        ral_set_log(RAL_LOG_MODULE, Bd_AppEnv::getCurrApp());
        
        $start = intval(microtime(true) * 1000);
        $ret = ral_loop($waitTime);
        $end = intval(microtime(true) * 1000);
        $triggerTimes = 1;
        if(false !== $ret && is_array($ret) && !empty($ret)){
            Bd_Log::trace('get some ral async resp: ' . var_export($ret, true));
            foreach ($ret as $name => $ralResp){
                $this->asyncResult[$name] = $ralResp;
                $this->_addAsyncStatData($name, 'recieve_time');
            }
            //ֱ�ӷ���ʱ���п��ܻ�û�д�����ǰ���첽
            if($end - $start < $waitTime){
                $ret = ral_loop($waitTime);
                $end = intval(microtime(true) * 1000);
                $triggerTimes = 2;
            }
        }
        $this->_addAsyncStatData($asyncName, 'trigger_time');
        $this->_addAsyncStatData($asyncName, 'trigger_consume', ($end - $start) . ':' . $triggerTimes);
        if(false === $ret){
            Bd_Log::fatal('ral_loop failed, errno: ' . ral_get_errno());
            throw new Exception('ral_loop failed', Pay_Def_ErrorCode::PAY_WEB_INTERNAL);
        }
        else{
            Bd_Log::trace('ral_loop trigger: ' . $asyncName . ', resp: ' . var_export($ret, true));
        }
    }
    
    /**
     * ���Ӳ������첽����
     * ע�⣺ral_event_addֻ�Ǵ����������ӣ������Ƿ����ú���δ֪��ral_loop($waitTime)��ʼд���ݲ��ȴ���
     * �����ǽ����������Ѿ������Ļ����ϣ������������û�н�����$waitTime������ֱ�ӷ��أ����ʱ���൱��û��������
     * �����ݡ�
     *
     * @param string $asyncName
     * @param string $service
     * @param string $path
     * @param array $data
     * @param array $headers
     * @param int $waitTime ��ѡ��default=3, ����ʱĬ�ϵȴ���ʱ
     * @throws Exception    RAL�첽�����쳣
     */
    public function addAndTriggerHttpAsyncRpc($asyncName, $service, $path, array $data, array $headers, $waitTime = 3){
        $this->addHttpAsyncRpc($asyncName, $service, $path, $data, $headers);
        $this->triggerAsyncRpc($asyncName, $waitTime);
    }
    
    /**
     * �ȴ�����ȡ�첽���ý��
     * 
     * @param string $asyncName �첽����KEY
     * @param number $expireTime   ����ʱ�䣨�첽�ȴ�ʱ�䣩��Ĭ��Ϊ300ms
     * @throws Exception
     */
    public function getAsyncRpcResult($asyncName, $waitTime = 300){
        $start = intval(microtime(true) * 1000);
        $this->_addAsyncStatData($asyncName, 'block_begin_time', $start);
        //���ڽ��ֱ�ӷ���
        if(isset($this->asyncResult[$asyncName])){
            $this->_addAsyncStatData($asyncName, 'block_end_time', $start);
            $this->_addAsyncStatData($asyncName, 'block_consume', '0:0');
            if($this->asyncStatConfig){
                Bd_Log::trace("async[$asyncName] found[1] and ral time data: " .  serialize($this->asyncStatData[$asyncName]));
            }
            Bd_Log::trace("get async[$asyncName] result");
            return $this->asyncResult[$asyncName];
        }
        //û����ral_loop
        $times = 0;
        $blockBeginTime = $start;
        $blockEndTime = $start;
        do{
            $blockBeginTime = $blockEndTime;
            $this->_addAsyncStatData($asyncName, "block_{$times}_begin_time", $blockBeginTime);
            
            $ret = ral_loop($waitTime);
            
            $blockEndTime = intval(microtime(true) * 1000);
            $this->_addAsyncStatData($asyncName, "block_{$times}_end_time", $blockEndTime);
            
            if(false === $ret){
                Bd_Log::fatal('ral_loop failed, errno: ' . ral_get_errno());
                throw new Exception('ral_loop failed', Pay_Def_ErrorCode::PAY_WEB_INTERNAL);
            }
            $found = false;
            if(is_array($ret) && !empty($ret)){
                Bd_Log::trace('get some ral async resp: ' . var_export($ret, true));
                foreach ($ret as $name => $ralResp){
                    $this->asyncResult[$name] = $ralResp;
                    $this->_addAsyncStatData($name, 'recieve_time', $blockEndTime);
                    if($asyncName == $name){
                        $found = true;
                    }
                }
            }
            
            $times ++;
            $waitTime -= ($blockEndTime - $blockBeginTime); //��ʣ�ĳ�ʱʱ��
            
            if(true === $ret || true === $found){
                break;
            }
        }while($waitTime > 0);
        $consumeTime = $blockEndTime - $start;
        $found = isset($this->asyncResult[$asyncName]) ? '1' : '0';
        $this->_addAsyncStatData($asyncName, 'block_end_time', $blockEndTime);
        $this->_addAsyncStatData($asyncName, 'block_consume', $consumeTime . ':' . $times);
        
        if($this->asyncStatConfig){
            Bd_Log::trace("async[$asyncName] found[$found] ral time data: " .  serialize($this->asyncStatData[$asyncName]));
        }
        if ($found) {
            Bd_Log::trace(sprintf("get async[%s] result", $asyncName));
            return $this->asyncResult[$asyncName];
        }
        else {
            Bd_Log::trace(sprintf("get async[%s] result failed", $asyncName));
            return null;
        }
    }
    
    /**
     * ���ػ���ͳһ���к������
     * 
     * @return string
     */
    public function getCacheExportData(){
        $cacheData = array();
        $rpcCache = Pay_Rpccache_RpcCache::getInstance()->exportCache();
        if($rpcCache){
            $cacheData['Pay_Rpccache_RpcCache'] = $rpcCache;
        }
        $utilCache = Pay_Util_Cache::exportCache();
        if($utilCache){
            $cacheData['Pay_Util_Cache'] = $utilCache;
        }
        return empty($cacheData) ? null : base64_encode(serialize($cacheData));
    }
    
    /**
     * ���ڴ��л���ı�׼�첽�������ͳһ���뻺�洦��
     * 
     * @param string $cacheDataStr  ��׼���л���Ļ�������
     */
    public function importCacheData($cacheDataStr){
        $cacheData = unserialize(base64_decode($cacheDataStr));
        if(is_array($cacheData) && !empty($cacheData)){
            foreach ($cacheData as $key => $data){
                switch ($key){
                    case 'Pay_Rpccache_RpcCache':
                        Pay_Rpccache_RpcCache::getInstance()->importCache($data);
                        break;
                    case 'Pay_Util_Cache':
                        Pay_Util_Cache::importCache($data);
                        break;
                    default:
                        Bd_Log::warning('unknown cache');
                }
            }
        }
    }
}
```
