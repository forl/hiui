import React, { Component } from 'react'
import classNames from 'classnames'
import { format, formatValue, getAttrs, formatAmount, filterObjProps } from './util'

/**
 * 自定义属性全小写；原声属性驼峰法
 * @prop type 输入框类型
 */
class Input extends Component {
  static _Input = ''

  constructor (props) {
    super(props)

    // 传入属性
    const commonAttrs = {
      type: 'text',
      size: 'm',
      prefixicon: '',
      suffixicon: '',
      prefix: '',
      suffix: ''
    }

    const oldProps = Object.assign({}, commonAttrs, this.props)
    const newProps = getAttrs(oldProps)
    const { prepend, append, value, defaultValue } = props
    // 分离有效属性和事件
    this.attrs = newProps.attrs
    const type = typeof value
    const valueSource = value === undefined ? defaultValue : value
    const prefix = typeof prepend === 'string' ? prepend : ''
    const suffix = typeof append === 'string' ? append : ''
    const prependNode = typeof prepend !== 'string' && prepend
    const appendNode = typeof append !== 'string' && append
    this.state = {
      value:
        type === 'string' || type === 'number' ? format(valueSource, this.props.type) : '',
      valueTrue: prefix + valueSource + suffix,
      hover: false,
      active: false,
      prefix,
      suffix,
      prepend: prependNode,
      append: appendNode
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.value !== undefined) {
      if (nextProps.value !== this.state.value) {
        this.setState({
          value: format(nextProps.value, this.props.type),
          valueTrue: nextProps.value
        })
      }
    }
    if (nextProps.prepend !== this.state.prepend || nextProps.append !== this.state.append) {
      const { prepend, append } = nextProps
      const prefix = typeof prepend === 'string' ? prepend : ''
      const suffix = typeof append === 'string' ? append : ''
      const prependNode = typeof prepend !== 'string' && prepend
      const appendNode = typeof append !== 'string' && append
      this.setState({
        prefix,
        suffix,
        prepend: prependNode,
        append: appendNode
      })
    }
  }

  /**
   * 渲染 text 输入框
   */
  renderText () {
    let { hover, active, value } = this.state
    let { disabled, type, id, placeholder, clearable } = this.props
    let { prefix, suffix, prepend, append } = this.state

    const noClear = ['textarea']
    let prefixId = id ? id + '_prefix' : ''
    let suffixId = id ? id + '_suffix' : ''
    const { defaultValue, ...attrs } = this.attrs
    const filterAttrs = filterObjProps(attrs, ['locale', 'theme', 'suffixicon', 'suffix', 'prepend', 'prefixicon', 'prefix', 'localeDatas', 'append'])
    return (
      <div
        className={classNames('hi-input__out', {
          'hi-input--prepend': prepend,
          'hi-input--append': append
        })}
      >
        {// 前置元素
          prepend && <span className='hi-input__prepend'>{prepend}</span>}
        <div className={`hi-input__inner${active ? ' active' : ''}${disabled ? ' disabled' : ''}`}>
          {// 前缀
            prefix && (
              <span id={prefixId} className='hi-input__prefix' data-value={prefix}>
                {prefix}
              </span>
            )}
          <input
            ref={arg => {
              this._Input = arg
            }}
            className={`hi-input__text ${disabled ? 'disabled' : ''}`}
            value={this.state.value}
            autoComplete='off'
            disabled={disabled}
            {...filterAttrs}
            placeholder={placeholder}
            onChange={e => {
              e.persist()
              let value = e.target.value
              let valueTrue = formatValue(value, type)

              if (prefix) {
                valueTrue = prefix + valueTrue
              }
              if (suffix) {
                valueTrue = valueTrue + suffix
              }

              value = format(value, type)

              this.props.onChange && this.props.onChange(e, valueTrue)

              this.props.value === undefined && this.setState({ value, valueTrue })
            }}
            onBlur={e => {
              e.persist()
              let value = e.target.value
              const valueTrue = this.state.valueTrue

              // amount 自动添加小数
              if (this.props.type === 'amount' && value !== '') {
                value = formatAmount(value)
              }

              this.setState({ active: false, value }, () => {
                this.props.onBlur && this.props.onBlur(e, valueTrue)
              })
            }}
            onFocus={e => {
              e.persist()
              const valueTrue = this.state.valueTrue

              this.setState({ active: true }, () => {
                this.props.onFocus && this.props.onFocus(e, valueTrue)
              })
            }}
            onKeyDown={e => {
              const valueTrue = this.state.valueTrue

              this.props.onKeyDown && this.props.onKeyDown(e, valueTrue)
            }}
            onKeyUp={e => {
              const valueTrue = this.state.valueTrue

              this.props.onKeyUp && this.props.onKeyUp(e, valueTrue)
            }}
            onKeyPress={e => {
              const valueTrue = this.state.valueTrue

              this.props.onKeyPress && this.props.onKeyPress(e, valueTrue)
            }}
            onInput={e => {
              const valueTrue = this.state.valueTrue

              this.props.onInput && this.props.onInput(e, valueTrue)
            }}
          />
          {// 清除
            noClear.indexOf(type) === -1 &&
            typeof prefix === 'undefined' &&
            typeof suffix === 'undefined' &&
            (value !== '' && clearable) && (
              <span
                className={`hi-input__fix-box ${hover && !disabled ? '' : 'invisible'}`}
                onClick={() => {
                  this._Input.focus()

                  const prefix = typeof this.props.prefix === 'undefined' ? '' : this.props.prefix
                  const suffix = typeof this.props.suffix === 'undefined' ? '' : this.props.suffix
                  const valueTrue = prefix + '' + suffix

                  this.setState({ value: '', valueTrue: valueTrue }, () => {
                    const e = {
                      target: this._Input
                    }
                    this.props.onChange && this.props.onChange(e, '')
                  })
                }}
              >
                <i className={`hi-input__clear hi-input__suffix__icon hi-icon icon-close-circle`} />
              </span>
            )}
          {// 后缀
            suffix && (
              <span id={suffixId} className='hi-input__suffix' data-value={suffix}>
                {suffix}
              </span>
            )}
        </div>
        {// 后置元素
          append && <span className='hi-input__append'>{append}</span>}
      </div>
    )
  }

  /**
   * 渲染 textarea
   */
  renderTextarea () {
    let { active } = this.state
    let { disabled } = this.props
    const { defaultValue, ...attrs } = this.attrs
    const filterAttrs = filterObjProps(attrs, ['locale', 'theme', 'suffixicon', 'suffix', 'prepend', 'prefixicon', 'prefix', 'localeDatas', 'append'])

    return (
      <textarea
        className={`hi-input ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
        style={this.props.style}
        autoComplete='off'
        value={this.state.value}
        disabled={disabled}
        {...filterAttrs}
        onChange={e => {
          e.persist()
          let valueTrue = e.target.value
          this.props.onChange && this.props.onChange(e, valueTrue)
          this.props.value === undefined && this.setState({ value: valueTrue, valueTrue })
        }}
        onBlur={e => {
          e.persist()
          let valueTrue = e.target.value

          this.setState({ active: false }, () => {
            this.props.onBlur && this.props.onBlur(e, valueTrue)
          })
        }}
        onFocus={e => {
          e.persist()
          const valueTrue = e.target.value

          this.setState({ active: true }, () => {
            this.props.onFocus && this.props.onFocus(e, valueTrue)
          })
        }}
        onKeyDown={e => {
          const valueTrue = e.target.value

          this.props.onKeyDown && this.props.onKeyDown(e, valueTrue)
        }}
        onKeyUp={e => {
          const valueTrue = e.target.value

          this.props.onKeyUp && this.props.onKeyUp(e, valueTrue)
        }}
        onKeyPress={e => {
          const valueTrue = e.target.value

          this.props.onKeyPress && this.props.onKeyPress(e, valueTrue)
        }}
        onInput={e => {
          const valueTrue = e.target.value

          this.props.onInput && this.props.onInput(e, valueTrue)
        }}
        onMouseOver={e => {
          this.setState({
            hover: true
          })
        }}
        onMouseLeave={e => {
          this.setState({
            hover: false
          })
        }}
      />
    )
  }

  render () {
    const { type } = this.attrs

    const { size, id, className, required } = this.props

    return type === 'textarea' ? this.renderTextarea() : (<div
      id={id}
      className={`hi-input ${className || ''} ${type || ''}${size ? ' hi-input_' + size : ''}${
        required ? ' required' : ''
      }`}
      style={this.props.style}
      data-value={this.state.valueTrue}
      onClick={e => {
        this._Input.focus()
      }}
      onMouseOver={e => {
        this.setState({
          hover: true
        })
      }}
      onMouseLeave={e => {
        this.setState({
          hover: false
        })
      }}
    >
      {this.renderText()}
    </div>)
  }
}

Input.defaultProps = {
  defaultValue: ''
}

export default Input
