import Animate from "./animate.js";

// 这个类用于管理工具栏，包括工具栏按钮的显示和隐藏
class ToolBar {
    /**
     * @param {object} config
     * @param {string} config.toolBar 工具栏的选择器，可以是选择器字符串、原生DOM对象或jQuery对象
     * @param {string[]} [config.needHideToolBtns] 在最开始需要隐藏的工具按钮
     */
    constructor(config) {
        this.config = config;
        this.$toolBar =
            this.config.toolBar instanceof jQuery
                ? this.config.toolBar
                : $(this.config.toolBar);

        // 这里的操控全依仗下面的this.toolBtns，也就是说，
        // 当点击this.paperBottomNavBtns.previous.element时，
        // 实际上是在调用this.toolBtns.previous.element的click事件
        // 相应的，当this.toolBtns.previous.element的状态发生变化时（例如被禁用或启用），
        // this.paperBottomNavBtns.previous.element的状态也会发生变化
        // 因为this.toolBtns绑定了更改this.paperBottomNavBtns的方法
        this.paperBottomNavBtns = {
            previous: {
                element: $("#paper-bottom-nav-previous")[0],
                disable: () => {
                    this.paperBottomNavBtns.previous.element.style.visibility =
                        "hidden";
                },
                enable: () => {
                    this.paperBottomNavBtns.previous.element.style.visibility =
                        "visible";
                },
            },
            indicator: {
                element: $("#paper-bottom-nav-indicator")[0],
            },
            max: {
                element: $("#paper-bottom-nav-indicator-max")[0],
            },
            next: {
                element: $("#paper-bottom-nav-next")[0],
                disable: () => {
                    this.paperBottomNavBtns.next.element.style.visibility =
                        "hidden";
                },
                enable: () => {
                    this.paperBottomNavBtns.next.element.style.visibility =
                        "visible";
                },
            },
        };

        this.toolBtns = {
            previous: {
                element: this.$toolBar.find("#paper-previous")[0],
                function: () => {},
                disable: () => {
                    this.toolBtns.previous.element.classList.add("disabled");
                    this.paperBottomNavBtns.previous.disable();
                },
                enable: () => {
                    this.toolBtns.previous.element.classList.remove("disabled");
                    this.paperBottomNavBtns.previous.enable();
                },
            },
            jumpto: {
                element: this.$toolBar.find("#paper-jumpto")[0],
                function: () => {},
                getValue: () =>
                    Number(
                        this.toolBtns.jumpto.element.querySelector("input")
                            .value
                    ),
                setValue: (value) => {
                    this.toolBtns.jumpto.element.querySelector("input").value =
                        value;
                    this.paperBottomNavBtns.indicator.element.innerHTML = value;
                },
                setRange: (min, max) => {
                    this.toolBtns.jumpto.element
                        .querySelector("input")
                        .setAttribute("min", min);
                    this.toolBtns.jumpto.element
                        .querySelector("input")
                        .setAttribute("max", max);
                    this.toolBtns.jumpto.element.querySelector(
                        ".max"
                    ).innerHTML = max;
                    this.paperBottomNavBtns.max.element.innerHTML = max;
                },
                disable: () => {
                    this.toolBtns.jumpto.element.classList.add("disabled");
                },
                enable: () => {
                    this.toolBtns.jumpto.element.classList.remove("disabled");
                },
            },
            next: {
                element: this.$toolBar.find("#paper-next")[0],
                function: () => {},
                disable: () => {
                    this.toolBtns.next.element.classList.add("disabled");
                    this.paperBottomNavBtns.next.disable();
                },
                enable: () => {
                    this.toolBtns.next.element.classList.remove("disabled");
                    this.paperBottomNavBtns.next.enable();
                },
            },
            save: {
                element: this.$toolBar.find("#paper-save")[0],
                function: () => {
                    console.log("save");
                },
                disable: () => {
                    this.toolBtns.save.element.classList.add("disabled");
                },
                enable: () => {
                    this.toolBtns.save.element.classList.remove("disabled");
                },
            },
            print: {
                element: this.$toolBar.find("#paper-print")[0],
                function: () => {
                    console.log("print");
                },
                disable: () => {
                    this.toolBtns.print.element.classList.add("disabled");
                },
                enable: () => {
                    this.toolBtns.print.element.classList.remove("disabled");
                },
            },
            email: {
                element: this.$toolBar.find("#paper-email")[0],
                function: () => {
                    console.log("email");
                },
                disable: () => {
                    this.toolBtns.email.element.classList.add("disabled");
                },
                enable: () => {
                    this.toolBtns.email.element.classList.remove("disabled");
                },
            },
        };

        this.previousActiveToolBtns = [
            "previous",
            "jumpto",
            "next",
            "save",
            "print",
            "email",
        ];
        // !不能直接赋值this.activeToolBtns = this.previousActiveToolBtns，因为会导致浅拷贝
        this.activeToolBtns = [
            "previous",
            "jumpto",
            "next",
            "save",
            "print",
            "email",
        ];

        this.hideAnimation = null;
        this.showAnimation = null;
        this.init();
    }

    init() {
        // 隐藏不需要的工具按钮
        const needHideToolBtns = this.config.needHideToolBtns || [];
        const toolsNames = Object.keys(this.toolBtns);
        this.previousActiveToolBtns = toolsNames.filter(
            (toolName) => !needHideToolBtns.includes(toolName)
        );
        this.activeToolBtns = toolsNames.filter(
            (toolName) => !needHideToolBtns.includes(toolName)
        );
        this.getToolBtns(needHideToolBtns).hide();

        // 为工具栏按钮绑定事件
        Object.values(this.toolBtns).forEach((toolBtn) => {
            toolBtn.element.addEventListener("click", this.buttonJump);
            toolBtn.element.addEventListener("click", () => {
                // 这里必须使用箭头函数，否则this指向会变成window导致出错
                if (toolBtn.element.classList.contains("disabled")) {
                    return;
                }
                this.toolBtns[
                    toolBtn.element.getAttribute("id").replace("paper-", "")
                ].function();
            });
            // 如果点击的是input，那么阻止事件冒泡
            toolBtn.element
                .querySelector("input")
                ?.addEventListener("click", (event) => {
                    event.stopPropagation();
                });
        });

        // 为底部分页按钮绑定事件
        this.paperBottomNavBtns.previous.element.addEventListener(
            "click",
            () => {
                // window.location.href = "#main-content";
                // 禁用上面的代码是因为上面的代码滚动动画看多了会晕，所以改成直接跳转
                // 下面的延时也是同样的原因
                document
                    .getElementById("main-content")
                    .scrollIntoView({ behavior: "instant" });
                setTimeout(() => {
                    this.toolBtns.previous.element.click();
                }, 250);
            }
        );
        this.paperBottomNavBtns.next.element.addEventListener("click", () => {
            // window.location.href = "#main-content";
            // 禁用上面的代码是因为上面的代码滚动动画看多了会晕，所以改成直接跳转
            // 下面的延时也是同样的原因
            document
                .getElementById("main-content")
                .scrollIntoView({ behavior: "instant" });
            setTimeout(() => {
                this.toolBtns.next.element.click();
            }, 250);
        });
    }

    /**
     * 用于在工具栏按钮被点击后让它跳一下
     * @param {event} event 事件对象
     * @returns {void}
     */
    async buttonJump(event) {
        const $element = $(event.currentTarget);
        if ($element.hasClass("disabled")) {
            return;
        }

        $element.addClass("active");
        await new Promise((resolve) => setTimeout(resolve, 150));
        $element.removeClass("active");
    }

    /**
     * 用于获取工具按钮
     * @param {string[]} toolBtnNameArray
     * @returns {JQuery<HTMLElement>} 返回一个jQuery对象
     */
    getToolBtns(toolBtnNameArray) {
        return toolBtnNameArray.reduce(
            ($toolBtns, toolBtnName) =>
                $toolBtns.add(this.toolBtns[toolBtnName].element),
            $()
        );
    }

    /**
     * 隐藏工具按钮的动画
     * @param {string[]} toolBtnNameArray
     * @returns {void}
     */
    hideToolBtns(toolBtnNameArray) {
        if (toolBtnNameArray.length === 0) {
            return;
        }

        if (this.hideAnimation) {
            this.hideAnimation.stop();
        }
        // if (this.showAnimation) {
        //     this.showAnimation.stop();
        //     this.showAnimation = null;
        // }

        // !以下几种情况可以跳过后面的缩小高度动画
        // 1. （工具栏从一些按钮完全换成另一些按钮，换之前和换之后没有交集），
        //    且更新后的列表（this.activeToolBtns）不为空（工具栏不空）

        const passRestoreHeightAnimation =
            this.activeToolBtns.filter((toolBtnName) =>
                this.previousActiveToolBtns.includes(toolBtnName)
            ).length === 0 && this.previousActiveToolBtns.length !== 0;

        const $toolBtns = this.getToolBtns(toolBtnNameArray);
        $toolBtns.css("transition", "none").each(function () {
            const $this = $(this);
            $this.attr("data-animate-height", `${$this.outerHeight()}px`);
            $this.attr("data-animate-margin-top", $this.css("margin-top"));
            $this.attr(
                "data-animate-margin-bottom",
                $this.css("margin-bottom")
            );
            $this.attr("data-animate-padding-top", $this.css("padding-top"));
            $this.attr(
                "data-animate-padding-bottom",
                $this.css("padding-bottom")
            );
        });

        const moveAnimation = $toolBtns
            .map((_, element) => {
                const $element = $(element);
                return {
                    selector: $element,
                    duration: 300,
                    params: {
                        transform: "translateX(160px)",
                    },
                };
            })
            .get();
        const hideAnimation = $toolBtns
            .map((_, element) => {
                const $element = $(element);
                return {
                    selector: $element,
                    duration: passRestoreHeightAnimation ? 0 : 300,
                    params: {
                        height: 0,
                        "margin-top": 0,
                        "margin-bottom": 0,
                        "padding-top": 0,
                        "padding-bottom": 0,
                    },
                };
            })
            .get();

        this.hideAnimation = new Animate({
            quene: [moveAnimation, hideAnimation],
            callback: () => {
                $toolBtns.hide();
                this.hideAnimation = null;
            },
        });
    }

    /**
     * 显示工具按钮的动画
     * @param {string[]} toolBtnNameArray
     * @returns {void}
     */
    showToolBtns(toolBtnNameArray) {
        if (toolBtnNameArray.length === 0) {
            return;
        }

        const $toolBtns = this.getToolBtns(toolBtnNameArray);
        // $toolBtns.show();

        // if (this.hideAnimation) {
        //     this.hideAnimation.stop();
        //     this.hideAnimation = null;
        // }
        if (this.showAnimation) {
            this.showAnimation.stop();
        }

        // !以下几种情况可以跳过前面的恢复高度动画，直接执行移动动画
        // 1. 当前活跃的按钮列表为空（工具栏空了）
        // 2. 隐藏动画执行完成后的工具栏为空（这个条件需要在启动前额外等待300ms）
        // 3. 工具栏不为空，但是需要展示的按钮均位于工具栏的最后且连续

        // 判断需要展示的按钮是否位于按钮列表的最后且连续
        // 例如，当前按钮列表为["previous", "jumpto", "next", "save", "print", "email"]
        // 需要展示的按钮列表为["save", "print", "email"]
        // 那么它们符合条件
        // 如果需要展示的按钮列表为["next", "print", "email"]
        // 那么它们不符合条件
        // 如果需要展示的按钮列表为["previous", "jumpto", "next"]，仍然不符合条件，因为它们结尾的按钮不是最后一个按钮
        const isContinuousAtEnd = toolBtnNameArray.every(
            (toolBtnName, index) => {
                const toolBtnKeys = Object.keys(this.toolBtns);
                const offsetIndex =
                    toolBtnKeys.length - toolBtnNameArray.length + index;
                const targetToolBtnName = toolBtnKeys[offsetIndex];

                return toolBtnName === targetToolBtnName;
            }
        );
        // 判断当前活跃的按钮列表是否为空
        const isActiveToolBtnsEmpty = this.previousActiveToolBtns.length === 0;

        // 判断隐藏动画执行完成后的工具栏是否为空，
        // 判断方法为：this.activeToolBtns 和 this.previousActiveToolBtns 的交集是否为空
        const isHideToolBtnsEmpty =
            this.activeToolBtns.filter((toolBtnName) =>
                this.previousActiveToolBtns.includes(toolBtnName)
            ).length === 0;

        // 判断是否需要跳过恢复高度动画
        const skipRestoreHeightAnimation =
            isContinuousAtEnd || isActiveToolBtnsEmpty || isHideToolBtnsEmpty;

        const showBtnAnimation = $toolBtns
            .map((_, element) => {
                const $element = $(element);
                return {
                    selector: $element,
                    duration: skipRestoreHeightAnimation ? 0 : 300,
                    params: {
                        height: $element.attr("data-animate-height"),
                        "margin-top": $element.attr("data-animate-margin-top"),
                        "margin-bottom": $element.attr(
                            "data-animate-margin-bottom"
                        ),
                        "padding-top": $element.attr(
                            "data-animate-padding-top"
                        ),
                        "padding-bottom": $element.attr(
                            "data-animate-padding-bottom"
                        ),
                    },
                };
            })
            .get();

        const moveAnimation = {
            selector: $toolBtns,
            duration: 300,
            params: {
                transform: "translateX(0px)",
            },
        };

        const animationQuene = [
            {
                selector: $toolBtns,
                duration: 0,
                params: {
                    display: "block",
                },
            },
            showBtnAnimation,
            moveAnimation,
        ];

        // 如果隐藏动画执行完成后的工具栏为空（工具栏从一些按钮完全换成另一些按钮，换之前和换之后没有交集），
        // 且之前不为空（也就是说，工具栏不能刚刚从空变成不空）
        if (isHideToolBtnsEmpty && !isActiveToolBtnsEmpty) {
            animationQuene.unshift({
                delay: 300,
            });
        }

        this.showAnimation = new Animate({
            quene: animationQuene,
            callback: () => {
                $toolBtns.removeAttr("style");
                $toolBtns.removeAttr(
                    "data-animate-height data-animate-margin-top data-animate-margin-bottom data-animate-padding-top data-animate-padding-bottom"
                );
                this.showAnimation = null;
            },
        });
    }

    /**
     * 更新任务栏
     * @param {string[]} toolBtnNameArray
     * @returns {void}
     */
    updateToolBarButtons(toolBtnNameArray) {
        this.previousActiveToolBtns = Array.from(this.activeToolBtns); // 深拷贝
        this.activeToolBtns = toolBtnNameArray;
        const hideToolBtns = this.previousActiveToolBtns.filter(
            (toolBtnName) => !this.activeToolBtns.includes(toolBtnName)
        );
        const showToolBtns = this.activeToolBtns.filter(
            (toolBtnName) => !this.previousActiveToolBtns.includes(toolBtnName)
        );
        // console.log(this.previousActiveToolBtns, this.activeToolBtns);
        this.hideToolBtns(hideToolBtns);
        this.showToolBtns(showToolBtns);
    }

    /**
     * 更新工具栏的功能，在切换了页面之后需要调用此函数以调整分页按钮的功能
     * @param {object} functions
     * @returns {void}
     */
    updateToolBarFunctions(functions) {
        Object.keys(functions).forEach((toolName) => {
            this.toolBtns[toolName].function = functions[toolName];
        });
    }
}

// 这个类用于管理分页的内容，包括切换页面、跳转页面、存储不同页面内容等
class Pagination {
    /**
     * @param {object} config 设置分页的配置
     * @param {string} config.element 分页的选择器，可以是jQuery对象，也可以是选择器字符串，还可以是原生的DOM对象
     * @param {string|string[]} config.contents 每一页的内容，是一个字符串或字符串数组，如果是字符串数组，那么每个字符串都是HTML代码，此时将禁用自动分页，改为使用传入的分页
     * @param {number} [config.page] (可选)当前页码，默认为1
     * @param {number} [config.totalPage] (可选)总页数，默认为contents的长度
     * @param {function[]} [config.onDisplay] (可选)每一页显示时的回调函数，是一个数组，数组的每一项都是一个函数。如果需要使用，在当前页没有回调函数，需要在对应位置使用null占位
     */
    constructor(config) {
        this.$element =
            config.element instanceof jQuery
                ? config.element
                : $(config.element);
        this.$pagination = $("#page-nav");
        this.contents = config.contents || [];
        // 如果contents是一个字符串，那么就把它分成多页
        if (typeof this.contents === "string") {
            this.contents = this.calculatePages(
                this.contents,
                this.$element.width(),
                this.$element.height()
            );
        }

        this.page = config.page || 1;
        this.totalPage = config.totalPage || this.contents.length;

        // 没有参数的话就是totalPage个null组成的数组，例如：[null, null, null, null, null]
        this.onDisplay =
            config.onDisplay ||
            Array.from({ length: this.totalPage }, () => null);
        // 如果onDisplay的长度为1且contents的长度大于1，那么就默认所有页面都使用这个回调函数
        if (this.onDisplay instanceof Function) {
            this.onDisplay = Array.from(
                { length: this.totalPage },
                () => this.onDisplay
            );
        }

        this.changePage = this.changePage.bind(this);
    }

    /**
     * 计算给定HTML文本需要分成多少段才能在给定的宽度和高度的容器中显示完
     * @param {string} html - HTML文本
     * @param {number} width - 容器的宽度
     * @param {number} height - 容器的高度
     * @returns {string[]} - 分好段的HTML数组
     */
    calculatePages(html, width, height) {
        // 新建一个解析器，把这些html代码解析成DOM树，然后提取所有的兄弟节点放到一个数组内
        // 这里只提取第一层的兄弟节点，不考虑嵌套的情况
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const nodes = Array.from(doc.body.childNodes);

        // 创建一个和目标容器具有相同宽度和高度的隐藏容器（通过visibility: hidden和position: fixed样式）。
        const container = document.createElement("div");
        container.style.visibility = "hidden";
        container.style.position = "fixed";
        container.style.zIndex = "-99999";
        container.style.width = `${width}px`;
        document.body.appendChild(container);

        // 逐个添加元素到隐藏容器中，并测算滚动高度
        // 当滚动高度超过视口高度时，就意味着需要新的一页
        // 将当前元素从隐藏容器中移除，并开始新的一页
        const pages = [];
        while (nodes.length > 0) {
            const node = nodes.shift();
            container.appendChild(node);
            if (container.scrollHeight > height) {
                node.remove();
                pages.push(container.innerHTML);
                container.innerHTML = "";
                container.appendChild(node);
            }
        }

        pages.push(container.innerHTML);
        document.body.removeChild(container); // 销毁隐藏容器
        return pages;
    }

    // /**
    //  * 生成一个分页器的列表项
    //  * @param {number} page 当前页码
    //  * @param {number} activePage 激活的页码（正在显示的页码）
    //  * @returns {string} 返回一个字符串，这个字符串是一个列表项（<li>），如果当前页码（page）等于页码（i + 1），那么这个列表项就添加一个"active"类。
    //  */
    // createPageItem(page, activePage) {
    //     const isActive = page === activePage;
    //     return `
    //         <li class="page-item ${isActive ? "active" : ""}">
    //             <button class="page-link" ocnclick="(() => this.jumpToPage(${page}))()">${page}</button>
    //         </li>
    //     `;
    // }

    // /**
    //  * 为某一页生成分页器
    //  * @param {number} page 这一页的页码
    //  * @param {number} pageCount 总页数
    //  * @returns {string[]} 分页器的HTML数组
    //  */
    // createPaginationForPage(page, pageCount) {
    //     let paginationHTML = "";
    //     // 添加分页的原则如下：
    //     // 1.如果总页数（pageCount）小于等于7，那么显示所有的页码。每个页码都是一个列表项（<li>），如果当前页码（page）等于页码（i + 1），那么这个列表项就添加一个"active"类。
    //     // 2.如果总页数大于7，那么只显示7个页码，具体显示哪7个页码取决于当前页码的位置：
    //     //     2.1. 如果当前页码小于等于3，那么显示前7个页码。
    //     //     2.2. 如果当前页码大于等于总页数减2，那么显示最后7个页码。
    //     //     2.3. 如果当前页码既不小于等于3，也不大于等于总页数减2，那么显示以当前页码为中心的7个页码。

    //     // 创建"上一页"按钮
    //     paginationHTML += `
    //     <li class="page-item ${page === 1 ? "disabled" : ""}">
    //         <button class="page-link" onclick="(() => this.jumpToPage(${
    //             page - 1
    //         }))()">&laquo;</button>
    //     </li>
    // `;

    //     // // 创建页码按钮
    //     // for (let page = 1; page <= pageCount; page++) {
    //     //     paginationHTML += this.createPageItem(page, page);
    //     // }
    //     // 创建页码按钮
    //     if (pageCount <= 7) {
    //         for (let thisPage = 1; thisPage <= pageCount; thisPage++) {
    //             paginationHTML += this.createPageItem(thisPage, page);
    //         }
    //     } else {
    //         if (page <= 3) {
    //             for (let thisPage = 1; thisPage <= 7; thisPage++) {
    //                 paginationHTML += this.createPageItem(thisPage, page);
    //             }
    //         } else if (page >= pageCount - 2) {
    //             for (
    //                 let thisPage = pageCount - 6;
    //                 thisPage <= pageCount;
    //                 thisPage++
    //             ) {
    //                 paginationHTML += this.createPageItem(thisPage, page);
    //             }
    //         } else {
    //             for (
    //                 let thisPage = page - 3;
    //                 thisPage <= page + 3;
    //                 thisPage++
    //             ) {
    //                 paginationHTML += this.createPageItem(thisPage, page);
    //             }
    //         }
    //     }
    //     // 创建"下一页"按钮
    //     paginationHTML += `
    //     <li class="page-item ${page === pageCount ? "disabled" : ""}">
    //         <button class="page-link" onclick="(() => this.jumpToPage(${
    //             page + 1
    //         }))()">&raquo;</button>
    //     </li>
    // `;

    //     return `<ul class="pagination mt-auto justify-content-center">${paginationHTML}</ul>`;
    // }

    // /**
    //  * 为所有页生成分页器
    //  * @param {number} pageCount 总页数
    //  * @param {number} activePage 激活的页码（正在显示的页码）
    //  * @returns {string[]} 分页器的HTML数组
    //  */
    // createPagination(pageCount) {
    //     const pagination = [];
    //     for (let page = 1; page <= pageCount; page++) {
    //         pagination.push(this.createPaginationForPage(page, pageCount));
    //     }
    //     return pagination;
    // }

    /**
     * 切换到指定页
     * @param {number} page 要切换到的页码
     * @param {boolean} [animation=true] 是否使用动画，默认为true
     * @returns {void}
     */
    async changePage(page, animation = true) {
        const html = this.contents[page - 1];
        const pageOnDisplay = this.onDisplay[page - 1] || (() => {});

        if (!animation) {
            this.$element.html(html);
            pageOnDisplay();
            return;
        }

        this.$element.css("opacity", 0);

        // 使用 Promise 替换 setTimeout
        await new Promise((resolve) => setTimeout(resolve, 150));

        // 把对应的文字按照换行符分割成数组，然后遍历数组，把每一行文字用p标签包裹起来
        this.$element.html(html);
        pageOnDisplay();
        this.$element.css("opacity", 1);
    }

    /**
     * 下一页
     * @returns {void}
     */
    nextPage() {
        if (this.page === this.totalPage) {
            return;
        }
        this.page++;
        this.changePage(this.page);
    }

    /**
     * 上一页
     * @returns {void}
     */
    previousPage() {
        if (this.page === 1) {
            return;
        }
        this.page--;
        this.changePage(this.page);
    }

    /**
     * 跳转到指定页
     * @param {number} page 要跳转到的页码
     * @returns {void}
     */
    jumpToPage(page) {
        if (page < 1 || page > this.totalPage || page === this.page) {
            return;
        }
        this.page = page;
        this.changePage(this.page);
    }
}

// 这个类用于管理板夹上的整个页面，包括页面的切换、工具栏的更新、分页器的更新等
class Paper {
    /**
     * @param {object} config
     * @param {string} config.sectionBar 侧边栏的选择器，可以是jQuery对象，也可以是选择器字符串，还可以是原生的DOM对象
     * @param {object[]} config.pages 页面的配置，是一个数组，数组的每一项都是一个对象，对象的属性如下：
     * @param {string} config.pages[].id 页面的id，用于在侧边栏中定位
     * @param {string[]} config.pages[].toolBar 页面的工具栏，是一个数组，数组的每一项都是一个字符串，字符串的内容是工具栏按钮的id
     * @param {string|string[]} config.pages[].content 每一页的内容，可以是一个字符串，也可以是一个字符串数组，如果是字符串数组，那么每个字符串都是HTML代码，此时将禁用自动分页，改为使用传入的分页
     * @param {function|function[]} [config.pages[].onDisplay] (可选)每一页显示时的回调函数，是一个数组，数组的每一项都是一个函数。如果需要使用，在当前页没有回调函数，需要在对应位置使用null占位
     * @returns {void}
     */
    constructor(config) {
        const $sectionBar =
            config.sectionBar instanceof jQuery
                ? config.sectionBar
                : $(config.sectionBar);
        this.$sectionBar = $sectionBar;
        // 页面
        this.pages = config.pages || [];
        // 遍历this.pages，把content转化为Pagination对象
        this.pages.forEach((page) => {
            if (page.pagination) {
                return;
            }

            page.pagination = new Pagination({
                element: `#${page.id}`,
                contents: page.content,
                onDisplay: page.onDisplay,
            });
        });

        this.toolBar = new ToolBar({
            toolBar: "#tool-bar",
            initialToolBtns: this.pages[0].toolBar,
        });

        this.init = this.init.bind(this);
        this.handleTabOnShow = this.handleTabOnShow.bind(this);
        this.init();
    }

    /**
     * 初始化函数
     * @returns {void}
     */
    init() {
        // 监听bootstrap的tab事件
        this.$sectionBar
            .find('a[data-bs-toggle="tab"]')
            .on("shown.bs.tab", this.handleTabOnShow);
        //加载第一个页面
        this.handleTabOnShow({
            target: this.$sectionBar.find('a[data-bs-toggle="tab"]')[0],
        });
    }

    /**
     * 在切换页面时调用的函数，负责更新工具栏和分页器按钮绑定的函数
     * @param {event} event 事件对象
     * @returns {void}
     */
    handleTabOnShow(event) {
        const $target = $(event.target); // newly activated tab
        const $previous = $(event.relatedTarget); // previous active tab
        const targetId = $target.attr("href").slice(1);
        // const previousId = $previous.attr("href").slice(1);
        const targetPage = this.pages.find((page) => page.id === targetId);
        // const previousPage = this.pages.find(page => page.id === previousId);
        // 显示这个页面，填充内容
        targetPage.pagination.changePage(targetPage.pagination.page, false);
        this.toolBar.updateToolBarButtons(targetPage.toolBar);
        this.pagination = targetPage.pagination;

        if (this.pagination.page === 1) {
            this.toolBar.toolBtns.previous.disable();
            // this.toolBar.toolBtns.next.enable();
            if (this.pagination.totalPage === 1) {
                this.toolBar.toolBtns.next.disable();
            } else {
                this.toolBar.toolBtns.next.enable();
            }
        } else if (this.pagination.page === this.pagination.totalPage) {
            this.toolBar.toolBtns.previous.enable();
            this.toolBar.toolBtns.next.disable();
        } else {
            this.toolBar.toolBtns.previous.enable();
            this.toolBar.toolBtns.next.enable();
        }
        this.toolBar.toolBtns.jumpto.setValue(this.pagination.page);
        this.toolBar.toolBtns.jumpto.setRange(1, this.pagination.totalPage);

        this.toolBar.updateToolBarFunctions({
            previous: () => {
                if (this.pagination.page === 1) {
                    return;
                }
                this.pagination.previousPage();
                this.toolBar.toolBtns.jumpto.setValue(this.pagination.page);
                this.toolBar.toolBtns.next.enable();
                if (this.pagination.page === 1) {
                    this.toolBar.toolBtns.previous.disable();
                }

                // this.pagination.previousPage();
                // console.log("previous");
            },
            jumpto: () => {
                this.pagination.jumpToPage(
                    this.toolBar.toolBtns.jumpto.getValue()
                );
                if (this.pagination.page === 1) {
                    this.toolBar.toolBtns.previous.disable();
                    this.toolBar.toolBtns.next.enable();
                } else if (this.pagination.page === this.pagination.totalPage) {
                    this.toolBar.toolBtns.next.disable();
                    this.toolBar.toolBtns.previous.enable();
                } else {
                    this.toolBar.toolBtns.previous.enable();
                    this.toolBar.toolBtns.next.enable();
                }
            },
            next: () => {
                if (this.pagination.page === this.pagination.totalPage) {
                    return;
                }
                this.pagination.nextPage();
                this.toolBar.toolBtns.jumpto.setValue(this.pagination.page);
                this.toolBar.toolBtns.previous.enable();
                if (this.pagination.page === this.pagination.totalPage) {
                    this.toolBar.toolBtns.next.disable();
                }
            },
        });
        // if (targetPage.pagination) {
        //     // console.log("pagination");
        //     this.pagination = new Pagination({
        //         element: `#${targetId} div`,
        //         page: 1,
        //         totalPage: 5,
        //         contents: texts,
        //     });
        //     this.toolBar.updateToolBarButtons(targetPage.toolBar);
        //     this.toolBar.updateToolBarFunctions({
        //         previous: () => {
        //             if (this.pagination.page === 1) {
        //                 return;
        //             }
        //             this.pagination.previousPage();
        //             this.toolBar.toolBtns.next.enable();
        //             if (this.pagination.page === 1) {
        //                 this.toolBar.toolBtns.previous.disable();
        //             }

        //             // this.pagination.previousPage();
        //             // console.log("previous");
        //         },
        //         jumpto: () => {
        //             this.pagination.jumpToPage(this.toolBar.toolBtns.jumpto.getValue());
        //         },
        //         next: () => {
        //             if (this.pagination.page === this.pagination.totalPage) {
        //                 return;
        //             }
        //             this.pagination.nextPage();
        //             this.toolBar.toolBtns.previous.enable();
        //             console.log(this.pagination.page, this.pagination.totalPage);
        //             console.log(this.pagination.page === this.pagination.totalPage);
        //             if (this.pagination.page === this.pagination.totalPage) {
        //                 this.toolBar.toolBtns.next.disable();
        //                 console.log(this.toolBar.toolBtns.next);
        //             }
        //         }
        //     });
        //     // console.log(this.toolBar.toolBtns.next.function());
        //     // console.log(this.toolBar.toolBtns.next.function);
        //     // console.log(this.toolBar.toolBtns.next.function());
        // }
    }
}

export { ToolBar, Pagination, Paper };

// !暂时弃用的代码
// /**
//  * 生成一个分页器的列表项
//  * @param {number} page 当前页码
//  * @param {number} activePage 激活的页码（正在显示的页码）
//  * @returns {jQuery} 返回一个 jQuery 对象，这个对象是一个列表项（<li>），如果当前页码（page）等于页码（i + 1），那么这个列表项就添加一个"active"类。
//  */
// createPageItem(page, activePage) {
//     const isActive = page === activePage;
//     const $li = $("<li>").addClass(`page-item ${isActive ? "active" : ""}`);
//     const $button = $("<button>")
//         .addClass("page-link")
//         .text(page)
//         .click(() => this.jumpToPage(page));
//     $li.append($button);
//     return $li;
// }

// /**
//  * 为某一页生成分页器
//  * @param {number} page 这一页的页码
//  * @param {number} pageCount 总页数
//  * @returns {jQuery} 分页器的 jQuery 对象
//  */
// createPaginationForPage(page, pageCount) {
//     const $ul = $("<ul>").addClass(
//         "pagination mt-auto justify-content-center"
//     );
//     // 创建"上一页"按钮
//     const $prevButton = $("<button>")
//         .addClass("page-link")
//         .text("«")
//         .click(() => this.jumpToPage(page - 1));
//     const $prevLi = $("<li>")
//         .addClass(`page-item ${page === 1 ? "disabled" : ""}`)
//         .append($prevButton);
//     $ul.append($prevLi);

//     // 创建页码按钮
//     // 添加分页的原则如下：
//     // 1.如果总页数（pageCount）小于等于7，那么显示所有的页码。每个页码都是一个列表项（<li>），如果当前页码（page）等于页码（i + 1），那么这个列表项就添加一个"active"类。
//     // 2.如果总页数大于7，那么只显示7个页码，具体显示哪7个页码取决于当前页码的位置：
//     //     2.1. 如果当前页码小于等于3，那么显示前7个页码。
//     //     2.2. 如果当前页码大于等于总页数减2，那么显示最后7个页码。
//     //     2.3. 如果当前页码既不小于等于3，也不大于等于总页数减2，那么显示以当前页码为中心的7个页码。

//     if (pageCount <= 7) {
//         for (let thisPage = 1; thisPage <= pageCount; thisPage++) {
//             $ul.append(this.createPageItem(thisPage, page));
//         }
//     } else if (page <= 3) {
//         for (let thisPage = 1; thisPage <= 7; thisPage++) {
//             $ul.append(this.createPageItem(thisPage, page));
//         }
//     } else if (page >= pageCount - 2) {
//         for (
//             let thisPage = pageCount - 6;
//             thisPage <= pageCount;
//             thisPage++
//         ) {
//             $ul.append(this.createPageItem(thisPage, page));
//         }
//     } else {
//         for (let thisPage = page - 3; thisPage <= page + 3; thisPage++) {
//             $ul.append(this.createPageItem(thisPage, page));
//         }
//     }

//     // 创建"下一页"按钮
//     const $nextButton = $("<button>")
//         .addClass("page-link")
//         .text("»")
//         .click(() => this.jumpToPage(page + 1));
//     const $nextLi = $("<li>")
//         .addClass(`page-item ${page === pageCount ? "disabled" : ""}`)
//         .append($nextButton);
//     $ul.append($nextLi);

//     return $ul;
// }

// /**
//  * 为所有页生成分页器
//  * @param {number} pageCount 总页数
//  * @param {number} activePage 激活的页码（正在显示的页码）
//  * @returns {jQuery[]} 分页器的 jQuery 对象数组
//  */
// createPagination(pageCount) {
//     const pagination = [];
//     for (let page = 1; page <= pageCount; page++) {
//         pagination.push(this.createPaginationForPage(page, pageCount));
//     }
//     return pagination;
// }
