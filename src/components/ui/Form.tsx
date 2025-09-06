import React from 'react'
import { useController } from 'react-hook-form'
import type { FieldPath, FieldValues, UseControllerProps } from 'react-hook-form'
import { Label } from './Label'

// Form Context
const FormFieldContext = React.createContext<{
  name: string
}>({} as { name: string })

const FormItemContext = React.createContext<{
  id: string
}>({} as { id: string })

// Form Root - Context Provider (NOT a form element)
export interface FormProps {
  children: React.ReactNode
}

export const Form: React.FC<FormProps> = ({ children }) => {
  return <>{children}</>
}

// Form Field
export interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends UseControllerProps<TFieldValues, TName> {
  render: ({ field, fieldState, formState }: Parameters<UseControllerProps<TFieldValues, TName>['render']>[0]) => React.ReactElement
}

export const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: FormFieldProps<TFieldValues, TName>) => {
  const controllerProps = useController(props)

  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      {props.render(controllerProps)}
    </FormFieldContext.Provider>
  )
}

// Form Item
export interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {}

export const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({ className = '', ...props }, ref) => {
    const id = React.useId()

    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={`space-y-2 ${className}`} {...props} />
      </FormItemContext.Provider>
    )
  }
)

FormItem.displayName = "FormItem"

// Form Label
export interface FormLabelProps extends React.ComponentPropsWithoutRef<typeof Label> {}

export const FormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  FormLabelProps
>(({ className = '', ...props }, ref) => {
  const { id } = React.useContext(FormItemContext)

  return (
    <Label
      ref={ref}
      className={className}
      htmlFor={id}
      {...props}
    />
  )
})

FormLabel.displayName = "FormLabel"

// Form Control
export interface FormControlProps {
  children: React.ReactElement
}

export const FormControl = React.forwardRef<HTMLElement, FormControlProps>(
  ({ children }, ref) => {
    const { id } = React.useContext(FormItemContext)
    const { name } = React.useContext(FormFieldContext)

    return React.cloneElement(children, {
      ref,
      id,
      'aria-describedby': `${id}-description`,
      'aria-invalid': false,
      ...children.props
    })
  }
)

FormControl.displayName = "FormControl"

// Form Description
export interface FormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const FormDescription = React.forwardRef<HTMLParagraphElement, FormDescriptionProps>(
  ({ className = '', ...props }, ref) => {
    const { id } = React.useContext(FormItemContext)

    return (
      <p
        ref={ref}
        id={`${id}-description`}
        className={`text-sm ${className}`}
        style={{ color: 'var(--text-secondary)' }}
        {...props}
      />
    )
  }
)

FormDescription.displayName = "FormDescription"

// Form Message
export interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode
}

export const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className = '', children, ...props }, ref) => {
    const { id } = React.useContext(FormItemContext)

    if (!children) return null

    return (
      <p
        ref={ref}
        id={`${id}-message`}
        className={`text-sm font-medium ${className}`}
        style={{ color: 'var(--color-error)' }}
        {...props}
      >
        {children}
      </p>
    )
  }
)

FormMessage.displayName = "FormMessage"