/*声明三个自定义js方法*/
/*不区分大小写的判断包含， 用于搜索文章标题过滤文章*/
jQuery.expr[':'].contains = function (a, i, m) {
    return jQuery(a).text().toUpperCase()
            .indexOf(m[3].toUpperCase()) >= 0;
};
/*区分大小写，用于搜索标签过滤文章*/
jQuery.expr[':'].contains_tag = function (a, i, m) {
    var tags = jQuery(a).data("tag").split(",");
    return $.inArray(m[3], tags) != -1;
};
/*区分大小写，用于搜索作者过滤文章*/
jQuery.expr[':'].contains_author = function (a, i, m) {
    var tags = jQuery(a).data("author").split(",");
    return $.inArray(m[3], tags) != -1;
};
var blog_path = $('.theme_blog_path').val();
blog_path= blog_path.lastIndexOf("/") === blog_path.length-1?blog_path.slice(0, blog_path.length-1):blog_path;

/*使用pjax加载页面，速度更快，交互更友好*/
var content = $(".pjax");
var container = $(".post");
$(document).pjax('.nav-right nav a,.nav-left .avatar_target,.site_url', '.pjax', {fragment: '.pjax', timeout: 8000});
$(document).on({
    /*点击链接后触发的事件*/
    'pjax:click': function () {
        /*原有内容淡出*/
        content.removeClass('fadeIns').addClass('fadeOuts');
        /*请求进度条*/
        NProgress.start();
    },

    /*pjax开始请求页面时触发的事件*/
    'pjax:start': function () {
        content.css({'opacity': 0});
    },

    /*pjax请求回来页面后触发的事件*/
    'pjax:end': function () {
        NProgress.done();
        container.scrollTop(0);
        afterPjax();

        /*移动端打开文章后，自动隐藏文章列表*/
        if ($(window).width() <= 1024) {
            $(".full-toc .full").trigger("click");
        }
    }
});
function afterPjax() {

    // 文章默认背景
    if (blog_path===''?location.pathname==='/':blog_path === location.pathname.split('/')[1]) {
       $('.post').addClass('index')
    } else {
        $('.post').removeClass('index')
    }

    /*渲染MathJax数学公式*/
    if($("script[type='text/x-mathjax-config']").length>0){
        $.getScript($("#MathJax-js").val(),function () {
            MathJax.Hub.Queue(
                ["resetEquationNumbers",MathJax.InputJax.TeX],
                ["Typeset",MathJax.Hub]
            );
        });
    }

    /*渲染高亮代码块结构与样式*/
    $('pre code').each(function (i, block) {
        hljs.highlightBlock(block);
    });
    /*新内容淡入*/
    content.css({'opacity': 1}).removeClass('fadeOuts').addClass('fadeIns');
    bind();
    /*discus获取评论数*/
    if ($(".theme_disqus_on").val() === "true") {
        DISQUSWIDGETS.getCount({reset: true});
    }
    if ($("#comments").hasClass("disqus")) {
        setTimeout(function () {
            if ($(".count-comment").text().trim() === "") {
                $(".count-comment").text(0);
            }
        }, 300);
    }
}

/*切换文章分类*/
$(".nav-left ul li>div").on("click", function (e) {
    $('.friend').removeClass('friend'); // 如果当前正在友链页，则先回显
    $("#local-search-input").val("").change();
    $(".nav-left li>div.active").removeClass("active");
    $(this).addClass("active");
    inputChange()
    $('#default-panel > .right-title').text($(this).data('rel'));
    $('#default-panel').show().siblings().hide();
    $('#outline-list').hide()
});

/* 渲染子类高度 */
$('.nav-left ul.sub').each(function () {
    $(this).height($(this).children().length * 26 - 1)
})

/* 展开子类 */
$('.nav-left ul>li>div>.fold').on('click', function (e) {
    var _this = this;
    e.stopPropagation();
    $(_this).toggleClass('unfold')
    $(_this).parent().next().toggleClass('hide')
    $(_this).parents('ul.sub').each(function () {
        if ($(_this).hasClass('unfold')) {
            $(this).height($(this).height() + parseInt($(_this).parent().next().attr('style').match(/\d+/g)[0]) + 1)
        } else {
            $(this).height($(this).height() - parseInt($(_this).parent().next().attr('style').match(/\d+/g)[0]) - 1)
        }
    })

})

/*鼠标移出文章列表后，去掉文章标题hover样式*/
$(".nav-right nav a").mouseenter(function (e) {
    $(".nav-right nav a.hover").removeClass("hover");
    $(this).addClass("hover");
});
$(".nav-right nav a").mouseleave(function (e) {
    $(this).removeClass("hover");
});

/*快捷键/组合键*/
var publickey = {"shift": false, "ctrl": false, "alt": false, "last": 0};
$(document).keydown(function (e) {
    var tobottom = container.prop("scrollHeight") - container.scrollTop() - container.height();
    var totop = container.scrollTop();
    if (!$("#local-search-input").is(":focus") && !$('#comments textarea').is(':focus')) {
        if (e.keyCode === 74) { /* J */
            container.animate({scrollTop: container.prop("scrollHeight") - container.height()}, tobottom, "linear");
        } else if (e.keyCode === 75) { /* K */
            container.animate({scrollTop: 0}, totop, "linear");
        } else if (e.keyCode === 71) { /* G */
            if (publickey.shift) {
                container.animate({scrollTop: container.prop("scrollHeight")}, 800);
            } else if (publickey.last === 71) { /* G */
                container.animate({scrollTop: 0}, 800);
            }
        } else if (e.keyCode === 16) { /* shift */
            publickey.shift = true;
        }
    }
})

$(document).keyup(function (e) {
    if (!$("#local-search-input").is(":focus") && !$('#comments textarea').is(':focus')) {
        if (e.keyCode === 83) { /* S - 显示/隐藏文章列表 */
            $(".full-toc .full").trigger("click");
        } else if (e.keyCode === 73 && ($(".nav").css('margin-left')==='0px') && !$('.title-list').hasClass('friend')) { /* I */
            $("#local-search-input").focus();
        } else if (e.keyCode === 87) { /* W - 显示/隐藏文章目录 */
            $(".full-toc .post-toc-menu").trigger("click");
        } else if (e.keyCode === 74 || e.keyCode === 75) { /* J K - 上滑/下滑*/
            container.stop(true);
        } else if (e.keyCode === 16) {
            publickey.shift = false;
        }
    }
    publickey.last = e.keyCode;
})

$("#local-search-input").blur(function (e) {
    $(".nav-right nav a.hover").removeClass("hover");
})
/*输入框焦点时的快捷键捕获*/
$("#local-search-input").keydown(function (e) {
    if ($(".nav-right nav a:not(:hidden), #local-search-result a:not(:hidden)").length > 0 && !$(".ac").is(":visible")) {
        if (e.which === 13) { /* 回车 */
            var $handle = $(".nav-right nav a.hover:not(:hidden), #local-search-result a.hover:not(:hidden)");
            if ($handle.length === 0) {
                $(".nav-right nav a:not(:hidden):first, #local-search-result a:not(:hidden):first").trigger("click");
            } else {
                $handle.trigger("click");
            }
            $(':focus').blur();
        } else if (e.which === 38) { /* 上 */
            if (!$('nav').is(':visible')) {
                if ($('#local-search-result a.hover').length === 0 || $('#local-search-result a.hover').parent().prevAll(":visible").length === 0) {
                    $("#local-search-result").scrollTop($("#local-search-result").prop("scrollHeight"));
                    $("#local-search-result a.hover").removeClass("hover");
                    $("#local-search-result a:visible:last").addClass("hover");
                } else {
                    $("#local-search-result a.hover").parent().prevAll().each(function () {
                        if ($(this).is(":visible")) {
                            $("#local-search-result a.hover").removeClass("hover");
                            $(this).children().addClass("hover");
                            if ($(this).offset().top - $(".nav-right .right-top").height() < 0) {
                                $("#local-search-result").scrollTop($("#local-search-result").scrollTop() - $(this).height());
                            }
                            return false;
                        }
                    })
                }
            } else {
                if ($("nav a:visible.hover").length === 0 || $("nav a:visible.hover").prevAll(":visible").length === 0) {
                    $("nav").scrollTop($("nav").prop("scrollHeight"));
                    $(".nav-right nav a.hover").removeClass("hover");
                    $(".nav-right nav a:visible:last").addClass("hover");
                } else {
                    $("nav a.hover").prevAll().each(function () {
                        if ($(this).is(":visible")) {
                            $(".nav-right nav a.hover").removeClass("hover");
                            $(this).addClass("hover");
                            if ($(this).offset().top - $(".nav-right .right-top").height() < 0) {
                                $("nav").scrollTop($("nav").scrollTop() - $(this).height());
                            }
                            return false;
                        }
                    })
                }
            }
        } else if (e.which===9 || e.which === 40) { /* 下 */
            if ($('nav').is(':visible')) {
                if ($("nav a:visible.hover").length === 0 || $("nav a:visible.hover").nextAll(":visible").length === 0) {
                    $("nav").scrollTop(0);
                    $(".nav-right nav a.hover").removeClass("hover");
                    $(".nav-right nav a:visible:first").addClass("hover");
                } else {
                    $("nav a.hover").nextAll().each(function () {
                        if ($(this).is(":visible")) {
                            $(".nav-right nav a.hover").removeClass("hover");
                            $(this).addClass("hover");
                            if (($("nav").height() + $(".nav-right .right-top").height() - $(this).offset().top) < 20) {
                                $("nav").scrollTop($("nav").scrollTop() + $(this).height());
                            }
                            return false;
                        }
                    })
                }
            } else {
                if ($("#local-search-result a:visible.hover").length === 0 || $("#local-search-result a:visible.hover").parent().nextAll(":visible").length === 0) {
                    $("#local-search-result").scrollTop(0);
                    $("#local-search-result a.hover").removeClass("hover");
                    $("#local-search-result a:visible:first").addClass("hover");
                } else {
                    $("#local-search-result a.hover").parent().nextAll().each(function () {
                        if ($(this).is(":visible")) {
                            $("#local-search-result a.hover").removeClass("hover");
                            $(this).children().addClass("hover");
                            if (($("#local-search-result").height() + $(".nav-right .right-top").height() - $(this).offset().top) < 20) {
                                $("#local-search-result").scrollTop($("#local-search-result").scrollTop() + $(this).prev().height());
                            }
                            return false;
                        }
                    })
                }
            }
            if (e.which === 9) {
                return false;
            }
        }
    }
});
$("#local-search-input").on("input", function (e) {
    inputChange();
});
$("#local-search-input").on("change", function (e) {
    inputChange();
});
// var searchContent;
/*根据搜索条件，过滤文章列表*/
function inputChange() {
    var val = $('#local-search-input').val().trim();
    // if (val === searchContent) {
    //     return;
    // }
    // searchContent = val;
    if ($('#local-search-result').length>0) {
        if (val.length>3 && (val.substr(0,3).toLowerCase() === 'in:' || val.substr(0,3).toLowerCase()==='in：')) {
            $('#title-list-nav').hide();
            $('#local-search-result').show();
            searchAll(val.substr(3))
        } else {
            $('#title-list-nav').show();
            $('#local-search-result').hide();
        }
    }

    var activeTitle = $(".nav-left ul li>div.active").data('rel');
    var searchType = '';
    var containType = '';
    $('#no-item-tips').hide()
    if (val === "") {
        $(".nav-right nav a").css("display", "none");
        $(".nav-right nav a." + activeTitle).css("display", "block");
    } else if (val.substr(0, 1) === "#") {
        searchType = '标签'
        containType = '为'
        $("div.ac > ul").attr("class", "tag");
        $("div.acParent").css("display", "block");
        if (val.substr(1).length !== 0) {
            $(".nav-right nav a").css("display", "none");
            $(".nav-right nav").find("a." + activeTitle + ":contains_tag('" + val.substr(1) + "')").css("display", "block");
        }
    } else if (val.substr(0, 1) === "@") {
        searchType = '作者'
        containType= '为'
        $("div.ac > ul").attr("class", "author");
        $("div.acParent").css("display", "block");
        if (val.substr(1).length != 0) {
            $(".nav-right nav a").css("display", "none");
            $(".nav-right nav").find("a." + activeTitle + ":contains_author('" + val.substr(1) + "')").css("display", "block");
        }
    } else {
        searchType = '标题'
        containType = '包含'
        $("div.acParent").css("display", "none");
        $(".nav-right nav a").css("display", "none");
        $(".nav-right nav").find("a." + activeTitle + ":contains('" + val + "')").css("display", "block");
    }
    if (val !== '' && $(".nav-right nav a:visible").length === 0) {
        $('#no-item-tips').show().html('未在 <span>' + activeTitle + '</span> 分类中找到'+ searchType + containType + ' <span>' + val + '</span> 的文章');
    }
}
$('#tagsWitchIcon').on('click', function () {
    $("#tagswitch").trigger('click');
})
/*是否展示标签列表*/
$("#tagswitch").on("change", function (e) {
    $(".nav-right .tags-list").css("display", $(this).prop("checked") ? "block" : "none");
    // 51 为 .tags-list 的 margin-top + margin-bottom + form 的 border-bottom  || 1 为 form 的 border-bottom
    var top = $(this).prop("checked") ? $(".nav-right .right-top").height() + $(".nav-right .tags-list").height() + 51 : $(".nav-right .right-top").height() + 1;
    if ($(window).width() > 426) {
        var height = $(document).height() - top - 11;// 11 为nav的border-top + padding-bottom
    }  else {
        height = $(document).height() - top - $('.nav-left').height() - 11;// 11 为nav的border-top + padding-bottom
    }
    $(".nav-right nav, #local-search-result").css({"top": top, "height": height});
});

/*隐藏/显示 文章列表*/
$(".full-toc .full,.semicircle").click(function (e) {
    if ($(window).width() <= 1024 && $(".nav").hasClass("mobile")) {
        $(".nav").removeClass("mobile");
        $(".full-toc .full").children().removeClass("mobile");
        return;
    }
    if ($(".full-toc .full").children().hasClass("min")) {
        $(".full-toc .full").children().removeClass("min").addClass("max");
        $(".nav, .hide-list").addClass("fullscreen");
        content.delay(200).queue(function () {
            $(".full-toc .full").addClass('fullscreen').dequeue();
        });
    } else {
        $(".full-toc .full").children().removeClass("max").addClass("min");
        $(".nav, .hide-list").removeClass("fullscreen");
        content.delay(300).queue(function () {
            $(".full-toc .full").removeClass('fullscreen').dequeue();
        });
    }
});

$(".post").hover(function () {
    $(".semicircle").css("margin-left", "-43px");
},function () {
    $(".semicircle").css("margin-left", "0");
})
var clickScrollTo = false
function syncOutline(_this) {
    if (!clickScrollTo) {
        var activeIndex = null
        $('#outline-list .toc-link').each(function (index) {
            var diff = _this.scrollTop - $(_this).find($(this).attr('href'))[0].offsetTop
            if (diff < -20) {
                activeIndex = index === 0 ? 0 : index - 1
                return false
            }
        })
        $('#outline-list .toc-link.active').removeClass('active')
        if (activeIndex === null) {
            $('#outline-list .toc-link:last').addClass('active')
        } else {
            $('#outline-list .toc-link:eq(' + activeIndex + ')').addClass('active')
        }
        if ($('#outline-list .toc-link.active')[0].offsetTop - $('#outline-list').height() - $('#outline-list')[0].scrollTop > -80) {
            $('#outline-list').scrollTop($('#outline-list .toc-link.active')[0].offsetTop + 80 - $('#outline-list').height())
        } else if ($('#outline-list .toc-link.active')[0].offsetTop < $('#outline-list')[0].scrollTop) {
            $('#outline-list').scrollTop($('#outline-list .toc-link.active')[0].offsetTop)
        }
    }
}

$(function () {
    bind();
    // 监测滚动，同步大纲
    container.on('scroll', function () {
        var _this = this
        var $rocket = $("#rocket");
        if (container.scrollTop() >= 200 && $rocket.css("display") === "none") {
            $("#rocket").removeClass("launch").css("display", "block").css("opacity", "0.5");
        } else if (container.scrollTop() < 200 && $rocket.css("display") === "block") {
            $("#rocket").removeClass("launch").css("opacity", "1").css("display", "none");
        }
        syncOutline(_this)
    })

    $('.more-menus').on('click', function () {
        $('.mobile-menus-out').addClass('show');
        $('.mobile-menus').addClass('show');
    })
    $('.mobile-menus-out,.mobile-menus a').on('click', function () {
        $('.mobile-menus-out').removeClass('show');
        $('.mobile-menus').removeClass('show');
    })

    // 显示输入框面板
    $('#default-panel > .icon-search').on('click', function (e) {
        $(this).parent().hide()
        $('#search-panel').css('display', 'flex')
        $('#local-search-input').select()
    })
    // 回到默认面板
    $('#search-panel > .icon-left').on('click', function () {
        $(this).parent().hide()
        $('#default-panel').show()


    })

    // 切换到大纲视图
    $('#default-panel > .icon-file-tree').on('click', function (e) {
        $(this).parent().hide()
        $('#title-list-nav').hide()
        $('#outline-panel').show()
        $('#outline-list').show()
    })

    // 回到默认面板
    $('#outline-panel > .icon-list').on('click', function (e) {
        $(this).parent().hide()
        $('#outline-list').hide()
        $('#default-panel').show()
        $('#title-list-nav').show()
    })

    $('.nav-left>ul').css('height', 'calc(100vh - '+($('.avatar_target img').outerHeight(true) + $('.author').outerHeight(true)+$('.nav-left .icon').outerHeight(true)+$('.left-bottom').outerHeight(true))+'px)');
    if ($('#local-search-result').length>0) {
        // 全文搜索
        $.getScript(blog_path + '/js/search.js', function () {
            searchFunc(blog_path + "/search.xml", 'local-search-input', 'local-search-result');
        })
    }
    //搜索框下的tag搜索事件
    $(".nav-right .tags-list li a").on("click", function (e) {
        $(" #local-search-input").val("#" + $(this).text().trim()).change();
    });
    //文章toc的显示隐藏事件
    $(".full-toc .post-toc-menu").on('click', function () {
        $('.post-toc').toggleClass('open');
    });
    /*回到页首*/
    $("#rocket").on("click", function (e) {
        $(this).addClass("launch");
        container.animate({scrollTop: 0}, 500);
    });

    if ($("#comments").hasClass("disqus")) {
        setTimeout(function () {
            if ($(".count-comment").text().trim() === "") {
                $(".count-comment").text(0);
            }
        }, 1500);
    }
    if ($(window).width() > 414) {
        /*设置文章列表title宽度*/
        $('.nav-right>nav>a>.post-title').css('width',$('.nav-right>nav>a').width() - $('.nav-right>nav>a>.post-date:first').width() - 40)
    }
    // 初始化tag列表宽度
    $('.tags-list').css('width', $('.nav-right').width() - 40)

    /*友情链接*/
    $('.friends').on('click',function () {
        $('.friends-area,.title-list').toggleClass('friend');
    })

    $('.friends-area .icon-left').on('click', function () {
        $('.friends-area,.title-list').removeClass('friend');
    })
});

/*绑定新加载内容的点击事件*/
function bind() {
    initArticle();
    $(".article_number").text($("#yelog_site_posts_number").val());
    $(".site_word_count").text($("#yelog_site_word_count").val());
    $(".site_uv").text($("#busuanzi_value_site_uv").text());
    $("#busuanzi_value_site_uv").bind("DOMNodeInserted", function (e) {
        $(".site_uv").text($(this).text())
    });
    $(".site_pv").text($("#busuanzi_value_site_pv").text())
    $("#busuanzi_value_site_pv").bind("DOMNodeInserted", function (e) {
        $(".site_pv").text($(this).text())
    });
    $(".post .pjax .index").find("br").remove();
    $(".post .pjax .index h1:eq(0)").addClass("article-title");
    //绑定文章内tag的搜索事件
    $(".post .pjax article .article-meta .tag a").on("click", function (e) {
        $(" #local-search-input").val("#" + $(this).text().trim()).change();
        if ($(window).width() <= 1024) {
            $(".full-toc .full").trigger("click");
        } else if ($(".full-toc .full span").hasClass("max")) {
            $(".full-toc .full").trigger("click");
        }
    });
    //绑定文章内分类的点击事件
    $(".post .pjax article .article-meta .book a").on("click", function (e) {
        $(".nav-left ul li>div[data-rel='" + $(this).data("rel") + "']").parents('.hide').each(function () {
            var _this = this;
            $(_this).removeClass('hide').prev().children('.fold').addClass('unfold');
            $(_this).parents('ul.sub').each(function () {
                $(this).height(parseInt($(this).attr('style').match(/\d+/g)[0]) + parseInt($(_this).attr('style').match(/\d+/g)[0]) + 1)
            })
        })
        $(".nav-left ul li>div[data-rel='" + $(this).data("rel") + "']").trigger("click");
        if ($(window).width() <= 1024) {
            $(".full-toc .full").trigger("click");
        } else if ($(".full-toc .full span").hasClass("max")) {
            $(".full-toc .full").trigger("click");
        }
    });
    //绑定文章内作者的点击事件
    $(".post .pjax article .article-meta .author").on("click", function (e) {
        $(" #local-search-input").val("@" + $(this).text().trim()).change();
        if ($(window).width() <= 1024) {
            $(".full-toc .full").trigger("click");
        } else if ($(".full-toc .full span").hasClass("max")) {
            $(".full-toc .full").trigger("click");
        }
    });
    //初始化文章toc
    // $(".post-toc-content").html($(".post .pjax article .toc-ref .toc").clone());
    $("#outline-list").html($(".post .pjax article .toc-ref .toc").clone());
    syncOutline(container[0])
    //绑定文章toc的滚动事件
    $("a[href^='#']").click(function () {
        var $this = $(this)
        if ($this.parents('#outline-list').length > 0) {
            $('#outline-list .toc-link.active').removeClass('active')
            $this.addClass('active')
        }
        clickScrollTo = true
		var targetOffsetTop = $($this.attr("href"))[0].offsetTop
        container.animate({scrollTop: container.scrollTop > targetOffsetTop ? (targetOffsetTop + 20) : (targetOffsetTop - 20)}, 500, 'swing', function () {
            clickScrollTo = false
        });
        if ($this.attr("href") === "#comments") {
            load$hide();
        }
        return false;
    });
    if ($("#comments").hasClass("disqus")) {
        var $disqusCount = $(".disqus-comment-count");
        $disqusCount.bind("DOMNodeInserted", function (e) {
            $(".count-comment").text(
                $this.text().replace(/[^0-9]/ig, "")
            )
        });
    }
    /*给文章中的站内跳转绑定pjax*/
    $(document).pjax('.post .pjax article a[target!=_blank]', '.pjax', {fragment: '.pjax', timeout: 8000});

    /*初始化 img*/
    if (img_resize != 'photoSwipe') {
        $(".pjax").find('img').each(function () {
            if (!$(this).parent().hasClass('div_img')) {
                $(this).wrap("<div class='div_img'></div>");
                var alt = this.alt;
                if (alt) {
                    $(this).after('<div class="img_alt"><span>' + alt + '</span></div>');
                }
            }
            if ($(window).width() > 426) {
                $(this).on("click", function (e) {
                    var _that = $(this);
                    $("body").append('<img class="img_hidden" style="display:none" src="' + this.src + '" />');
                    var img_width = "";
                    var img_height = "";
                    var img_top = "";
                    var img_left = "";
                    if ((this.width / this.height) > (document.body.clientWidth / document.body.clientHeight) && $(".img_hidden").width() > document.body.clientWidth) {
                        img_width = document.body.clientWidth + "px";
                        img_height = this.height * document.body.clientWidth / this.width + "px";
                        img_top = (document.body.clientHeight - this.height * document.body.clientWidth / this.width) / 2 + "px";
                        img_left = "0px";
                    } else if (((this.width / this.height) < (document.body.clientWidth / document.body.clientHeight) && $(".img_hidden").height() > document.body.clientHeight)) {
                        img_width = this.width * document.body.clientHeight / this.height + "px";
                        img_height = document.body.clientHeight + "px";
                        img_top = "0px";
                        img_left = (document.body.clientWidth - this.width * document.body.clientHeight / this.height) / 2 + "px";
                    } else {
                        img_height = $(".img_hidden").height() + "px";
                        img_width = $(".img_hidden").width() + "px";
                        img_top = (document.body.clientHeight - $(".img_hidden").height()) / 2 + "px";
                        img_left = (document.body.clientWidth - $(".img_hidden").width()) / 2 + "px";
                    }
                    $("body").append('<div class="img_max" style="opacity: 0"></div>');
                    $("body").append('<img class="img_max" src="' + this.src + '" style="top:' + $(this).offset().top + 'px;left:' + $(this).offset().left + 'px; width:' + $(this).width() + 'px;height: ' + this.height + 'px;">');
                    $(this).css("visibility", "hidden");
                    setTimeout(function () {
                        $("img.img_max").attr("style", "").css({
                            "top": img_top,
                            "left": img_left,
                            "width": img_width,
                            "height": img_height
                        });
                        $("div.img_max").css("opacity", "1");
                    }, 10);
                    $(".img_max").on("click", function (e) {
                        $("img.img_max").css({
                            "width": _that.width() + "px",
                            "height": _that.height() + "px",
                            "top": _that.offset().top + "px",
                            "left": _that.offset().left + "px"
                        })
                        $("div.img_max").css("opacity", "0");
                        setTimeout(function () {
                            _that.css("visibility", "visible");
                            $(".img_max").remove();
                            $(".img_hidden").remove();
                        }, 500);
                    })
                })
            }
        });
    }

}
