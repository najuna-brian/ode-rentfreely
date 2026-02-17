import {
  isEnumControl,
  RankedTester,
  rankWith,
  ControlProps,
} from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { Typography, Box, useTheme } from '@mui/material';
import QuestionShell from '../components/QuestionShell';
import { tokens } from './tokens-adapter';

const parsePx = (value: string): number =>
  parseInt(String(value).replace('px', ''), 10) || 1;

type AnyControlProps = ControlProps & { errors?: string };

const cardEnumControlTester: RankedTester = rankWith(6, isEnumControl);

const CardEnumControl = (props: AnyControlProps) => {
  const theme = useTheme();
  const {
    data,
    handleChange,
    path,
    schema,
    uischema,
    errors,
    enabled = true,
  } = props;
  const label = (uischema as any)?.label || schema.title;
  const description = schema.description;
  const required = Boolean(
    (uischema as any)?.options?.required ?? (schema as any)?.options?.required,
  );

  const options =
    schema.oneOf?.map((o: any) => ({
      value: o.const ?? o.enum?.[0] ?? o,
      label: o.title ?? String(o.const ?? o),
    })) ||
    (schema.enum || []).map((v: any) => ({ value: v, label: String(v) }));

  return (
    <QuestionShell
      title={label}
      description={description}
      required={required}
      error={errors}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {options.map(opt => {
          const selected = data === opt.value;
          return (
            <Box
              key={String(opt.value)}
              onClick={() => enabled && handleChange(path, opt.value)}
              sx={theme => {
                const isDark = theme.palette.mode === 'dark';
                const grey = theme.palette.grey as unknown as
                  | Record<number, string>
                  | undefined;
                const lineColor = isDark
                  ? (grey?.[800] ?? theme.palette.divider)
                  : (grey?.[200] ?? theme.palette.divider);
                const borderColor = selected
                  ? theme.palette.primary.main
                  : lineColor;
                const leftBorderWidth =
                  (tokens as any).border?.width?.medium ?? '2px';
                const linePx = parsePx(leftBorderWidth);
                const borderBg = (color: string) => ({
                  backgroundImage: [
                    `linear-gradient(to right, ${color} 0, ${color} ${linePx}px, transparent 100%)`,
                    `linear-gradient(to right, ${color} 0, ${color} ${linePx}px, transparent 100%)`,
                  ].join(', '),
                  backgroundSize: `100% ${linePx}px, 100% ${linePx}px`,
                  backgroundPosition: '0 0, 0 100%',
                  backgroundRepeat: 'no-repeat',
                });
                return {
                  position: 'relative',
                  borderRadius: tokens.border.radius.lg,
                  backgroundColor: 'transparent',
                  ...borderBg(borderColor),
                  cursor: enabled ? 'pointer' : 'default',
                  overflow: 'hidden',
                  px: 2,
                  py: 1.5,
                  '&:hover': enabled
                    ? {
                        ...borderBg(theme.palette.primary.main),
                      }
                    : {},
                  '&:active': enabled
                    ? {
                        ...borderBg(theme.palette.primary.main),
                        '--option-active-color': theme.palette.primary.main,
                        '& > .MuiTypography-root.MuiTypography-subtitle1': {
                          color: 'var(--option-active-color)',
                          fontWeight: 500,
                        },
                      }
                    : {},
                };
              }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 500,
                  position: 'relative',
                  zIndex: 1,
                  color: selected
                    ? theme.palette.primary.main
                    : 'var(--option-active-color, inherit)',
                }}>
                {opt.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </QuestionShell>
  );
};

// NOTE: We removed the shell wrappers for text/number/integer/date controls because
// they interfere with JSONForms' internal cell rendering mechanism.
// The default materialRenderers handle these controls properly.
// Only export custom renderers that don't break cell rendering.
export const shellMaterialRenderers = [
  // Card-style enum control - a custom renderer that uses QuestionShell
  {
    tester: cardEnumControlTester,
    renderer: withJsonFormsControlProps(CardEnumControl),
  },
];
