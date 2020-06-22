# C 语言

## my_more.c

```c
/* my_more.c - version 0.1  
 * read and print 24 lines then pause for a few special commands
 * by sunnnychan@gmail.com
 * 2013/11/25
 */

#include <stdio.h>
#include <errno.h>
#include <stdlib.h>

#define PAGE_ROW_DISPLY 24
#define PAGE_LINE_DISPLAY 512

void do_more(FILE *);
int get_cmd(FILE *);

int main(int ac, char *av[])
{
    FILE *fp;
    if (1 == ac)
        do_more(stdin);
    else {
        while (--ac) { /*  more than one file, deal with one by one */
            if ((fp = fopen(*++av, "r")) != NULL) {
                do_more(fp);
                fclose(fp);
            } else {
                perror("Open file :");
                exit(1);
            }
        }
    }
    return 0;
}

void do_more(FILE * fp)
/*  
 *  read PAGE_LINE_DISPLAY, then call get_cmd() for further instrustions 
 */
{
    char line_char_arr[PAGE_LINE_DISPLAY];
    int num_of_lines = 0;
    int replay;
    FILE *fp_tty;    /* 解决通过管道传递数据给程序的问题，与用户交互的输入不能再从标准输入读取  */
    fp_tty = fopen("/dev/tty", "r");  /* 直接读取键盘的设备文件 */
    while (fgets(line_char_arr, PAGE_LINE_DISPLAY, fp) != NULL) {  /* input  */
    /* 书上这里的只判断等于，我加了大于的情况，用于处理输入回车的情况 */
    if (num_of_lines >= PAGE_ROW_DISPLY) {  /* full screen ? */
        replay = get_cmd(fp_tty);  /* ask user */
        if (0 == replay) { /* input 'q', means quit */
            exit(1);
        }
        if (PAGE_ROW_DISPLY == replay) { /* input space ,dispay next page  */
            num_of_lines = 0;  /* reset page line count  */
        }
    } 
    if (fputs(line_char_arr, stdout) == EOF) /* ouput a line  */
        exit(1);
        num_of_lines++; /* count current page lines */
    }
}

int get_cmd(FILE * fp_tty)
/*
 * print message, wait for response,
 * q means quit, space means next page, CR means next line
 * */
{
    int char_from_input;
    printf("\033[7m more ?\033[m");   /* reverse on a vt100 */
    fflush(stdout);  /* flush stdout buffer */
/* 
 *  getc 或getchar 在读取用户输入时，回车符会被读入缓冲区，被当成函数的输入。
 *  这种情况下，难以区分是用户主动输入的回车，还是为了提交输入字符而输入的回车符。
 *  解决方案是：为键盘输入，重新设定两个字符大小的缓冲区，输入一次后，把缓冲区第二个空间置为对程序无影响的字符
 */
    char get_char_buffer[2];
    setbuf(fp_tty, get_char_buffer);
    while ((char_from_input = getc(fp_tty)) != EOF) {  /* get response */
    get_char_buffer[1] = '\0';
    switch (char_from_input) {
        case 'q':  /* q stand for quit */
            return 0;
        case ' ':    /* space stand for display next page */
            return PAGE_ROW_DISPLY;
        case '\n':   /* CR stand for display next line */
            return 1;
        }
    }
    return 0;
}
```