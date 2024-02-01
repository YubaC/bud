// 这个类用于管理动画，包括动画的执行和停止
class Animate {
    /**
     * @param {object} config
     * @param {string[]} [config.quene] 动画队列，里面的动画会逐个执行
     *                                  每个动画都是一个字典，包含以下属性：
     *                                  - selector: 选择器，可以是选择器字符串、原生DOM对象或jQuery对象
     *                                  - duration: 动画的持续时间，单位是毫秒
     *                                  - params: 动画的参数，是一个字典，使用CSS属性作为键，使用CSS属性值作为值
     *                                            例如：{ "width": "100px", "height": "100px" }
     *                                  - delay（可选）: 动画的延迟时间，单位是毫秒，当此属性存在时，其他属性可以省略
     *                                  - easing（可选）: 动画的缓动函数
     *                                  例如：{ selector: "#paper-report", duration: 1000, params: { "width": "100px", "height": "100px" } }
     *                                  当子元素是一个数组时，会同时执行数组内的所有动画
     *                                  TODO: 暂时不支持时间轴动画
     * @param {function} [config.callback] 动画队列执行完毕后的回调函数
     */
    constructor(config) {
        this.quene = config.quene || [];
        this.callback = config.callback || (() => {});

        this.runningAnimation = null;
        this.stopFlag = false;

        this.init = this.init.bind(this);
        this.init();
    }

    async init() {
        for (let animate of this.quene) {
            if (this.stopFlag) {
                break;
            }

            if (Array.isArray(animate)) {
                const animationPromises = animate.map((anim) =>
                    this.doAnimation(anim)
                );
                this.runningAnimation = await Promise.all(animationPromises);
            } else {
                this.runningAnimation = await this.doAnimation(animate);
            }
        }

        this.callback();
    }

    /** 执行动画的函数
     * @param {object} animate 动画对象，和构造函数的config.quene数组中的元素相同
     * @returns {promise | null} 如果动画时间不为0，则返回一个promise对象，否则返回null
     */
    doAnimation(animate) {
        const $element =
            animate.selector instanceof jQuery
                ? animate.selector
                : $(animate.selector);
        const duration = animate.duration || 0;
        const params = animate.params;
        const delay = animate.delay || 0;
        const easing = animate.easing || "swing";

        if (delay) {
            return new Promise((resolve) => {
                setTimeout(resolve, delay);
            });
        }

        if (duration === 0) {
            $element.css(params);
            return null;
        }

        const promise = new Promise((resolve) => {
            setTimeout(() => {
                $element.animate(params, {
                    duration,
                    easing,
                    complete: resolve,
                });
            }, delay);
        });

        return promise;
    }

    stop() {
        this.stopFlag = true;
        if (this.runningAnimation) {
            if (Array.isArray(this.runningAnimation)) {
                this.runningAnimation.forEach((animation) => {
                    if (!animation) {
                        return;
                    }
                    const $element =
                        animation.selector instanceof jQuery
                            ? animation.selector
                            : $(animation.selector);
                    $element.stop();
                });
            } else {
                const $element =
                    this.runningAnimation.selector instanceof jQuery
                        ? this.runningAnimation.selector
                        : $(this.runningAnimation.selector);
                $element.stop();
            }
        }
    }
}

export default Animate;
