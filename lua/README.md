# Lua

## 解析并计算字符串逻辑表达式

```lua
local str_find = string.find
local str_sub = string.sub
local table_sort = table.sort

local function trim(str, substr)
    local strRet = str
    local s, e = str_find(strRet, '^' .. substr .. '+', 1)
    if s then
        strRet = str_sub(strRet, e + 1)
    end
    s, e = str_find(strRet, substr .. '+$', 1)
    if s then
        strRet = str_sub(strRet, 1, e - 1)
    end
    return strRet
end

local function ipairsBySortedKey(t)
    local t_tmp = {}
    for k in pairs(t) do
        if type(k) == 'number' then
            t_tmp[#t_tmp + 1] = k
        end
    end
    table.sort(t_tmp)
    local i = 0
    return function()
        i = i + 1
        return t_tmp[i], t[t_tmp[i]]
    end
end

local function parseStrExpress(strExpress)
    -- 删除表达式两端没有意义的空格
    local strExpress = trim(strExpress, ' ')
    -- 先检查表达式开始是 ! 开头，且 取反操作是针对整个表达式的
    local wholeNotFlag = false
    local checkRet = strExpress:find('^![ ]*[(].*[)]$', 1)
    if checkRet ~= nil then
        -- 如果是，置取反标识，在求出真个表达式值时取反
        wholeNotFlag = true
        -- 删除开头的 取反 符号
        strExpress = strExpress:sub(2)
    end
    strExpress = trim(strExpress, ' ')
    -- 删除表达式两段开头和结尾 成对的 括号
    while strExpress:sub(1, 1) == '(' do
        if strExpress:sub(-1) == ')' then
            strExpress = strExpress:sub(2, -2)
        else
            error('logic express format invalid.')
        end
    end
    strExpress = trim(strExpress, ' ')
    -- 找到当前表达式 第一层级 的 '|' '&' 操作符
    local braceCout = 0
    local arrIndexList = {}
    for index = 1, #strExpress, 1 do
        if strExpress:sub(index, index) == '(' then
            braceCout = braceCout + 1
        elseif strExpress:sub(index, index) == ')' then
            braceCout = braceCout - 1
        elseif strExpress:sub(index, index) == '|' or strExpress:sub(index, index) == '&' then
            if braceCout == 0 then
                -- print("index : " .. index .. ' Char : ' .. strExpress:sub(index, index))
                arrIndexList[index] = strExpress:sub(index, index)
            end
        end
    end
    -- 如果括号不成对，表达式不合法
    if braceCout ~= 0 then error('logic express format invalid.') end
    -- 如果当前表达式中不包含 '|' '&', 也不为空(为空表达式不合法),
    -- 则 表达式为 true, false, !true, !false, !(false), !(true), !(!true) 中的一种，称之为元表达式（可以直接求出值）
    if next(arrIndexList) == nil then
        if strExpress == '' then error('logic express format invalid.') end
        local notFlag = false
        if strExpress:sub(1, 1) == '!' then
            notFlag = true;
            strExpress = strExpress:sub(2)
        end
        strExpress = trim(strExpress, ' ')
        local strExpressValue = nil
        if strExpress == 'false' then
            strExpressValue = false
        elseif strExpress == 'true' then
            strExpressValue = true
        else
            error('logic express format invalid. has value not false or true : ' .. strExpress)
        end
        if notFlag then strExpressValue = not strExpressValue end
        if wholeNotFlag then strExpressValue = not strExpressValue end
        return strExpressValue
    end
    -- 如果当前表达式不是元表达式，变量当前层级的 '|' 和 '&'，按照它们来划分子表达式
    local boolRet = nil
    local k_prev, v_prev = nil, nil
    for k, v in ipairsBySortedKey(arrIndexList) do
        -- 求出第一个子表达式的 值
        if boolRet == nil then
            k_prev = k
            v_prev = v
            boolRet = parseStrExpress(strExpress:sub(1, k_prev - 1))
        else
            -- 根据前一个表达式的值 和 接下来的 逻辑运算符号，来计算 这两个表达式组成的表达式的值
            if (v_prev == '&' and boolRet == true) or (v_prev == '|' and boolRet == false) then
                -- print(strExpress .. ' : ' .. strExpress:sub(k_prev + 1, k - 1))
                boolRet = parseStrExpress(strExpress:sub(k_prev + 1, k - 1))
            end
            k_prev = k
            v_prev = v
        end
    end
    -- 求出最后一个表达式
    if (v_prev == '&' and boolRet == true) or (v_prev == '|' and boolRet == false) then
        boolRet = parseStrExpress(strExpress:sub(k_prev + 1))
    end
    if wholeNotFlag then boolRet = not boolRet end
    return boolRet
end

-- Test
local Test = {
    [1] = 'true',
    [2] = '!true',
    [3] = 'true|false',
    [4] = 'true|true',
    [5] = 'true&false',
    [6] = 'true&true',
    [7] = '!false&true',
    [8] = 'true&!false',
    [9] = 'true&!(false|false)',
    [10] = 'true&(false|!false)',
    [11] = 'true&!(false|!false)&true',
    [12] = '!false&! ( true )',
    [13] = 'false|(true&(!false))',
    [14] = 'false|(true&(!false))|!(false)',
    [15] = 'false|(true&(!false))|!(false)&(false|!true)',
    [16] = 'true&(true|true|true|true)',
}

function Test:run()
    for k, v in ipairsBySortedKey(self) do
        local callRet = parseStrExpress(v)
        print('Test ' .. k .. ' : ' .. v .. ' = ' .. tostring(callRet))
    end
end
```